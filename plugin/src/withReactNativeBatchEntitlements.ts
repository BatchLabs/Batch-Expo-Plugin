import { ConfigPlugin, withEntitlementsPlist } from "@expo/config-plugins";

export const withReactNativeBatchEntitlements: ConfigPlugin<object | void> = (
  config,
) => {
  return withEntitlementsPlist(config, (config) => {
    config.modResults = {
      ...config.modResults,
      "aps-environment":
        config.modResults["aps-environment"] ?? "$(APS_ENVIRONMENT)",
    };
    return config;
  });
};
