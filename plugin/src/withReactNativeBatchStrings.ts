import { ConfigPlugin, withStringsXml } from '@expo/config-plugins';
import { Props } from './withReactNativeBatch';

export const withReactNativeBatchStrings: ConfigPlugin<Props> = (config, props) => {
    return withStringsXml(config, (config) => {
        const strings = config.modResults.resources.string ?? [];
        const apiKey = {
            $: { name: 'BATCH_API_KEY' },
            _: props.androidApiKey,
        };
        config.modResults.resources.string = [...strings, apiKey];
        return config;
    })
};
