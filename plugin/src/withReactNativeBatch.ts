import { ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";
import {
  withApplyPlugin,
  withClassPath,
  withGoogleServicesFile,
} from "@expo/config-plugins/build/android/GoogleServices";

import { withReactNativeBatchManifest } from "./withReactNativeBatchManifest";
import { withReactNativeBatchEntitlements } from "./withReactNativeBatchEntitlements";
import { withReactNativeBatchInfoPlist } from "./withReactNativeBatchInfoPlist";
import { withReactNativeBatchStrings } from "./withReactNativeBatchStrings";

export type Props = {
  iosApiKey: string;
  androidApiKey: string;
  enableDoNotDisturb?: boolean;
  enableDefaultOptOut?: boolean;
  enableProfileCustomIDMigration?: boolean;
  enableProfileCustomDataMigration?: boolean;
  androidSmallIconResourceId?: string;
  androidNotificationsColor?: string;
};
/**
 * Apply react-native-batch configuration for Expo SDK 42 projects.
 */
const withReactNativeBatch: ConfigPlugin<Props | void> = (config, props) => {
  const _props = props || { androidApiKey: "", iosApiKey: "" };
  let newConfig = withGoogleServicesFile(config);
  newConfig = withClassPath(newConfig);
  newConfig = withApplyPlugin(newConfig);
  newConfig = withReactNativeBatchManifest(newConfig, _props);
  newConfig = withReactNativeBatchStrings(newConfig, _props);
  newConfig = withReactNativeBatchInfoPlist(newConfig, _props);
  newConfig = withReactNativeBatchEntitlements(newConfig);
  return newConfig;
};

const pkg = require("../../package.json");
export default createRunOncePlugin(withReactNativeBatch, pkg.name, pkg.version);
