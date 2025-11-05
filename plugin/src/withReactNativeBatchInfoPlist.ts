import { ConfigPlugin, withInfoPlist, InfoPlist } from '@expo/config-plugins';

import {
  BATCH_DO_NOT_DISTURB_INITIAL_STATE,
  BATCH_DEFAULT_OPT_OUT_INITIAL_STATE,
  BATCH_DEFAULT_PROFILE_CUSTOM_ID_MIGRATION,
  BATCH_DEFAULT_PROFILE_CUSTOM_DATA_MIGRATION,
} from './constants';
import { Props } from './withReactNativeBatch';
import {resolveBooleanProps} from "./helpers";

export const modifyInfoPlist = (infoPlist: InfoPlist, props: Props): InfoPlist => {
  infoPlist.BatchAPIKey = props.iosApiKey;
  infoPlist.BatchDoNotDisturbInitialState = resolveBooleanProps(props.enableDoNotDisturb, BATCH_DO_NOT_DISTURB_INITIAL_STATE);
  infoPlist.BatchProfileCustomIdMigrationEnabled = resolveBooleanProps(props.enableProfileCustomIDMigration, BATCH_DEFAULT_PROFILE_CUSTOM_ID_MIGRATION);
  infoPlist.BatchProfileCustomDataMigrationEnabled = resolveBooleanProps(props.enableProfileCustomDataMigration, BATCH_DEFAULT_PROFILE_CUSTOM_DATA_MIGRATION);
  infoPlist.BATCH_OPTED_OUT_BY_DEFAULT = resolveBooleanProps(props.enableDefaultOptOut, BATCH_DEFAULT_OPT_OUT_INITIAL_STATE);
  return infoPlist;
};

export const withReactNativeBatchInfoPlist: ConfigPlugin<Props> = (config, props) => {
  return withInfoPlist(config, config => {
    config.modResults = modifyInfoPlist(config.modResults, props);
    return config;
  });
};
