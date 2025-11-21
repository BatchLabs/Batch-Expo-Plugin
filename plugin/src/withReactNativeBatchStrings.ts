import {
  AndroidConfig,
  ConfigPlugin,
  withStringsXml,
} from "@expo/config-plugins";
import { Props } from "./withReactNativeBatch";

export const withReactNativeBatchStrings: ConfigPlugin<Props> = (
  config,
  props,
) => {
  return withStringsXml(config, (config) => {
    if (props.androidApiKey) {
      AndroidConfig.Strings.setStringItem(
        [
          {
            $: {
              name: "BATCH_API_KEY",
              translatable: "false",
            },
            _: props.androidApiKey,
          },
        ],
        config.modResults,
      );
    } else {
      console.error("⚠️ [Batch] `androidApiKey` cannot be null or undefined.");
    }
    return config;
  });
};
