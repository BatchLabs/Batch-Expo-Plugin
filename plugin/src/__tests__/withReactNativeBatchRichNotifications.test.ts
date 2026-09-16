/**
 * The fixture is the `ios/HelloWorld.xcodeproj/project.pbxproj` of
 * `expo-template-bare-minimum@sdk-54`, which is the project `expo prebuild`
 * starts from.
 *
 * These tests run the mod against the real pbxproj parser rather than a mocked
 * project on purpose: what we are guarding against are matching bugs, and a
 * hand written mock would carry the very assumptions that are being tested.
 */
import fs from "fs";
import os from "os";
import path from "path";

import { BATCH_TARGET_NAME } from "../constants";
import { Props } from "../withReactNativeBatch";
import { withReactNativeBatchRichNotifications } from "../withReactNativeBatchRichNotifications";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const xcode = require("xcode");

const FIXTURE = path.join(__dirname, "fixtures", "project.pbxproj");
const APP_TARGET_NAME = "HelloWorld";

const PROPS: Props = {
  iosApiKey: "ios-api-key",
  androidApiKey: "android-api-key",
  enableIOSRichNotifications: true,
};

let projectRoot: string;
let platformProjectRoot: string;
let pbxProjectPath: string;

beforeEach(() => {
  projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "batch-expo-plugin-"));
  platformProjectRoot = path.join(projectRoot, "ios");
  pbxProjectPath = path.join(
    platformProjectRoot,
    `${APP_TARGET_NAME}.xcodeproj`,
    "project.pbxproj",
  );
  fs.mkdirSync(path.dirname(pbxProjectPath), { recursive: true });
  fs.copyFileSync(FIXTURE, pbxProjectPath);
});

afterEach(() => {
  fs.rmSync(projectRoot, { recursive: true, force: true });
});

const unquote = (value: unknown): string =>
  typeof value === "string" ? value.replace(/^"(.*)"$/, "$1") : "";

/** Reads the project from disk, runs the mod, and writes it back, as a prebuild does. */
const prebuild = async (
  expoConfig: Record<string, unknown>,
  props: Props = PROPS,
): Promise<any> => {
  const pbxProject = xcode.project(pbxProjectPath);
  pbxProject.parseSync();

  let config: any = { name: "test", slug: "test", ...expoConfig, mods: {} };
  config = withReactNativeBatchRichNotifications(config, props);

  const xcodeMod = config.mods?.ios?.xcodeproj;
  if (xcodeMod) {
    config = await xcodeMod({
      ...config,
      modResults: pbxProject,
      modRequest: {
        projectRoot,
        platformProjectRoot,
        platform: "ios",
        modName: "xcodeproj",
        introspect: false,
      },
    });
    fs.writeFileSync(pbxProjectPath, config.modResults.writeSync());
  }
  return pbxProject;
};

const extensionBuildSettings = (pbxProject: any): any[] =>
  Object.values(pbxProject.pbxXCBuildConfigurationSection())
    .filter(
      (configuration: any) =>
        configuration?.buildSettings &&
        unquote(configuration.buildSettings["PRODUCT_NAME"]) ===
          BATCH_TARGET_NAME,
    )
    .map((configuration: any) => configuration.buildSettings);

const updateAppTargetBuildSettings = (settings: Record<string, string>) => {
  const pbxProject = xcode.project(pbxProjectPath);
  pbxProject.parseSync();
  Object.values(pbxProject.pbxXCBuildConfigurationSection()).forEach(
    (configuration: any) => {
      if (
        configuration?.buildSettings &&
        unquote(configuration.buildSettings["PRODUCT_NAME"]) === APP_TARGET_NAME
      ) {
        Object.assign(configuration.buildSettings, settings);
      }
    },
  );
  fs.writeFileSync(pbxProjectPath, pbxProject.writeSync());
};

const A_VERSION = {
  version: "5.9.2",
  ios: { bundleIdentifier: "com.test.app", buildNumber: "1000902369" },
};

describe("withReactNativeBatchRichNotifications", () => {
  it("adds the extension target and copies its files", async () => {
    const pbxProject = await prebuild(A_VERSION);

    expect(pbxProject.pbxGroupByName(BATCH_TARGET_NAME)).toBeTruthy();
    expect(
      fs.readdirSync(path.join(platformProjectRoot, BATCH_TARGET_NAME)).sort(),
    ).toEqual([
      `${BATCH_TARGET_NAME}-Info.plist`,
      `${BATCH_TARGET_NAME}.entitlements`,
      "NotificationService.swift",
    ]);
    expect(extensionBuildSettings(pbxProject)).toHaveLength(2);
  });

  it("does nothing when rich notifications are disabled", async () => {
    const pbxProject = await prebuild(A_VERSION, {
      ...PROPS,
      enableIOSRichNotifications: false,
    });

    expect(pbxProject.pbxGroupByName(BATCH_TARGET_NAME)).toBeNull();
    expect(extensionBuildSettings(pbxProject)).toHaveLength(0);
  });

  it("sets the extension version from the app config", async () => {
    const pbxProject = await prebuild(A_VERSION);

    extensionBuildSettings(pbxProject).forEach((buildSettings) => {
      expect(buildSettings["MARKETING_VERSION"]).toBe("5.9.2");
      expect(buildSettings["CURRENT_PROJECT_VERSION"]).toBe("1000902369");
    });
  });

  it("gives ios.version priority over version, like Expo does", async () => {
    const pbxProject = await prebuild({
      version: "5.9.2",
      ios: { bundleIdentifier: "com.test.app", version: "6.0.0" },
    });

    extensionBuildSettings(pbxProject).forEach((buildSettings) => {
      expect(buildSettings["MARKETING_VERSION"]).toBe("6.0.0");
    });
  });

  it("falls back to the same version as the app Info.plist", async () => {
    // Expo writes 1.0.0 (1) to the app Info.plist when the config has neither,
    // so anything else here would recreate the ITMS-90473 mismatch.
    const pbxProject = await prebuild({
      ios: { bundleIdentifier: "com.test.app" },
    });

    extensionBuildSettings(pbxProject).forEach((buildSettings) => {
      expect(buildSettings["MARKETING_VERSION"]).toBe("1.0.0");
      expect(buildSettings["CURRENT_PROJECT_VERSION"]).toBe("1");
    });
  });

  it("inherits the build settings of the app target", async () => {
    updateAppTargetBuildSettings({
      SWIFT_VERSION: "6.0",
      IPHONEOS_DEPLOYMENT_TARGET: "16.0",
      DEVELOPMENT_TEAM: "ABCDE12345",
    });

    const pbxProject = await prebuild(A_VERSION);

    extensionBuildSettings(pbxProject).forEach((buildSettings) => {
      expect(buildSettings["SWIFT_VERSION"]).toBe("6.0");
      expect(buildSettings["IPHONEOS_DEPLOYMENT_TARGET"]).toBe("16.0");
      expect(buildSettings["DEVELOPMENT_TEAM"]).toBe("ABCDE12345");
    });
  });

  describe("on a later prebuild", () => {
    it("refreshes the version without adding a second target", async () => {
      await prebuild(A_VERSION);
      const pbxProject = await prebuild({
        version: "5.9.3",
        ios: { bundleIdentifier: "com.test.app", buildNumber: "1000902400" },
      });

      const buildSettings = extensionBuildSettings(pbxProject);
      expect(buildSettings).toHaveLength(2);
      buildSettings.forEach((settings) => {
        expect(settings["MARKETING_VERSION"]).toBe("5.9.3");
        expect(settings["CURRENT_PROJECT_VERSION"]).toBe("1000902400");
      });
      expect(
        Object.values(pbxProject.pbxNativeTargetSection()).filter(
          (target: any) => unquote(target?.name) === BATCH_TARGET_NAME,
        ),
      ).toHaveLength(1);
    });

    it("refreshes the build settings inherited from the app target", async () => {
      await prebuild(A_VERSION);
      updateAppTargetBuildSettings({
        SWIFT_VERSION: "6.0",
        IPHONEOS_DEPLOYMENT_TARGET: "16.0",
        DEVELOPMENT_TEAM: "ABCDE12345",
      });

      const pbxProject = await prebuild(A_VERSION);

      extensionBuildSettings(pbxProject).forEach((buildSettings) => {
        expect(buildSettings["SWIFT_VERSION"]).toBe("6.0");
        expect(buildSettings["IPHONEOS_DEPLOYMENT_TARGET"]).toBe("16.0");
        expect(buildSettings["DEVELOPMENT_TEAM"]).toBe("ABCDE12345");
      });
    });

    it("finds the extension once the project file has been normalized", async () => {
      await prebuild(A_VERSION);
      // CocoaPods and Xcode rewrite the project and drop the quotes they judge
      // unneeded, which happens on the very first `pod install` after the
      // extension is added.
      const normalized = xcode.project(pbxProjectPath);
      normalized.parseSync();
      Object.values(normalized.pbxXCBuildConfigurationSection()).forEach(
        (configuration: any) => {
          if (
            configuration?.buildSettings &&
            unquote(configuration.buildSettings["PRODUCT_NAME"]) ===
              BATCH_TARGET_NAME
          ) {
            configuration.buildSettings["PRODUCT_NAME"] = BATCH_TARGET_NAME;
          }
        },
      );
      fs.writeFileSync(pbxProjectPath, normalized.writeSync());

      const pbxProject = await prebuild({
        version: "5.9.3",
        ios: { bundleIdentifier: "com.test.app", buildNumber: "1000902400" },
      });

      const buildSettings = extensionBuildSettings(pbxProject);
      expect(buildSettings).toHaveLength(2);
      buildSettings.forEach((settings) => {
        expect(settings["MARKETING_VERSION"]).toBe("5.9.3");
        expect(settings["CURRENT_PROJECT_VERSION"]).toBe("1000902400");
      });
    });
  });
});
