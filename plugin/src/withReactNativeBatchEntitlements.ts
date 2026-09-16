import { ConfigPlugin, withEntitlementsPlist } from "@expo/config-plugins";

export const withReactNativeBatchEntitlements: ConfigPlugin<object | void> = (
  config,
) => {
  return withEntitlementsPlist(config, (config) => {
    // Only provide a default: the `ios.entitlements` of the app config, and any
    // other plugin that already configured APNs, must win over us. `development`
    // is the right default since Xcode rewrites it to `production` in the
    // archive of a release build. This mirrors what expo-notifications does.
    if (!config.modResults["aps-environment"]) {
      config.modResults = {
        ...config.modResults,
        "aps-environment": "development",
      };
    }
    return config;
  });
};
