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
    return config;
  });
};
