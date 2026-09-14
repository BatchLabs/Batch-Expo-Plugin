import {
  ConfigPlugin,
  XcodeProject,
  withPodfile,
  withXcodeProject,
} from "@expo/config-plugins";
import fs from "fs";
import path from "path";

import { Props } from "./withReactNativeBatch";
import {
  BATCH_TARGET_NAME,
  PODFILE_TARGET_MARKER,
  PODFILE_SNIPPET,
  BATCH_DEFAULT_IOS_RICH_NOTIFICATIONS,
} from "./constants";
import { resolveBooleanProps } from "./helpers";

export const withReactNativeBatchRichNotifications: ConfigPlugin<Props> = (
  config,
  props,
) => {
  const enableIOSRichNotifications = resolveBooleanProps(
    props.enableIOSRichNotifications,
    BATCH_DEFAULT_IOS_RICH_NOTIFICATIONS,
  );
  if (!enableIOSRichNotifications) {
    return config;
  }
  let newConfig = withXcodeProject(config, async (config) => {
    const pbxProject = config.modResults;
    if (pbxProject.pbxGroupByName(BATCH_TARGET_NAME)) {
      console.debug(
        "[Batch] Batch Rich Notifications extension already added. Skipping.",
      );
      setExtensionVersion(pbxProject, config);
      return config;
    }
    const platformProjectRoot = config.modRequest.platformProjectRoot;
    const templateRoot = path.resolve(
      __dirname,
      "..",
      "..",
      "ios",
      "rich-notifications",
    );
    const extensionSourceRoot = path.join(
      platformProjectRoot,
      BATCH_TARGET_NAME,
    );

    const infoPlistFileName = `${BATCH_TARGET_NAME}-Info.plist`;
    const entitlementsFileName = `${BATCH_TARGET_NAME}.entitlements`;
    const notificationServiceFileName = "NotificationService.swift";

    const entitlementsFilePath = path.posix.join(
      BATCH_TARGET_NAME,
      entitlementsFileName,
    );

    // Copy extension files to the project directory
    fs.mkdirSync(extensionSourceRoot, { recursive: true });
    for (const fileName of [
      infoPlistFileName,
      entitlementsFileName,
      notificationServiceFileName,
    ]) {
      const sourcePath = path.join(templateRoot, fileName);
      const destinationPath = path.join(extensionSourceRoot, fileName);
      if (!fs.existsSync(destinationPath) && fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destinationPath);
      }
    }

    const objects = pbxProject.hash.project.objects;
    // Fix to have the target dependency from the app target
    objects["PBXTargetDependency"] = objects["PBXTargetDependency"] || {};
    objects["PBXContainerItemProxy"] = objects["PBXContainerItemProxy"] || {};

    // Add a new target
    const batchTarget = pbxProject.addTarget(
      BATCH_TARGET_NAME,
      "app_extension",
      BATCH_TARGET_NAME,
      `${config.ios?.bundleIdentifier}.${BATCH_TARGET_NAME}`,
    );

    const batchGroup = pbxProject.addPbxGroup(
      [notificationServiceFileName, infoPlistFileName, entitlementsFileName],
      BATCH_TARGET_NAME,
      BATCH_TARGET_NAME,
    );
    const groups = objects["PBXGroup"];
    for (const groupUUID of Object.keys(groups)) {
      if (
        typeof groups[groupUUID] === "object" &&
        groups[groupUUID].name === undefined &&
        groups[groupUUID].path === undefined
      ) {
        pbxProject.addToPbxGroup(batchGroup.uuid, groupUUID);
      }
    }

    // Add build phase
    pbxProject.addBuildPhase(
      [notificationServiceFileName],
      "PBXSourcesBuildPhase",
      "Sources",
      batchTarget.uuid,
    );

    // Add build settings
    const appTargetBuildSettings = getAppTargetBuildSettings(pbxProject);
    let configs = pbxProject.pbxXCBuildConfigurationSection();
    for (let id in configs) {
      let buildSettings = configs[id].buildSettings;
      if (
        buildSettings &&
        buildSettings["PRODUCT_NAME"] === `"${BATCH_TARGET_NAME}"`
      ) {
        let swiftVersion = appTargetBuildSettings["SWIFT_VERSION"];
        let devTeam = appTargetBuildSettings["DEVELOPMENT_TEAM"];
        let deploymentTarget =
          appTargetBuildSettings["IPHONEOS_DEPLOYMENT_TARGET"];
        if (devTeam) {
          buildSettings["DEVELOPMENT_TEAM"] = devTeam;
        }
        buildSettings["CODE_SIGN_ENTITLEMENTS"] = `"${entitlementsFilePath}"`;
        buildSettings["CODE_SIGN_STYLE"] = "Automatic";
        buildSettings["SWIFT_VERSION"] = swiftVersion || "5.0";
        buildSettings["TARGETED_DEVICE_FAMILY"] = `"1,2"`;
        buildSettings["IPHONEOS_DEPLOYMENT_TARGET"] =
          deploymentTarget || "15.1";
      }
    }
    setExtensionVersion(pbxProject, config);
    config.modResults = pbxProject;
    return config;
  });

  // Add Batch Extension to Podfile
  newConfig = withPodfile(newConfig, (config) => {
    const contents = config.modResults.contents;
    if (!contents.includes(PODFILE_TARGET_MARKER)) {
      config.modResults.contents = `${contents.trimEnd()}${PODFILE_SNIPPET}`;
    }
    return config;
  });

  return newConfig;
};

/**
 * The extension Info.plist resolves its version from $(MARKETING_VERSION) and
 * $(CURRENT_PROJECT_VERSION). Expo writes the app version to the app Info.plist
 * only and never touches the build settings, so without this the extension is
 * always built as 1.0 (1) and App Store Connect reports an ITMS-90473
 * CFBundleVersion mismatch with its containing application.
 */
const setExtensionVersion = (
  pbxProject: XcodeProject,
  config: {
    version?: string;
    ios?: { version?: string; buildNumber?: string };
  },
): void => {
  const version = config.ios?.version || config.version || "1.0";
  const buildNumber = config.ios?.buildNumber || "1";
  const configs = pbxProject.pbxXCBuildConfigurationSection();
  for (const id in configs) {
    const buildSettings = configs[id].buildSettings;
    if (
      buildSettings &&
      buildSettings["PRODUCT_NAME"] === `"${BATCH_TARGET_NAME}"`
    ) {
      buildSettings["MARKETING_VERSION"] = version;
      buildSettings["CURRENT_PROJECT_VERSION"] = buildNumber;
    }
  }
};

const getAppTargetBuildSettings: any = (pbxProject: XcodeProject): object => {
  const nativeTargets = pbxProject.pbxNativeTargetSection();
  const appTarget: any = Object.entries(nativeTargets).find(
    ([, value]: any) => {
      return (
        value &&
        typeof value === "object" &&
        value.productType === '"com.apple.product-type.application"'
      );
    },
  )?.[1];
  const appConfigListId = appTarget?.buildConfigurationList;
  const configList = pbxProject.pbxXCConfigurationList()?.[appConfigListId];
  const buildConfigs = configList?.buildConfigurations || [];
  const allConfigs = pbxProject.pbxXCBuildConfigurationSection();
  return allConfigs[buildConfigs[0].value]?.buildSettings || {};
};
