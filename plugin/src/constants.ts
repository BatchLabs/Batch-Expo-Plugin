// Default config plugin
export const BATCH_DO_NOT_DISTURB_INITIAL_STATE = false;
export const BATCH_DEFAULT_OPT_OUT_INITIAL_STATE = false;
export const BATCH_DEFAULT_PROFILE_CUSTOM_ID_MIGRATION = true;
export const BATCH_DEFAULT_PROFILE_CUSTOM_DATA_MIGRATION = true;
export const BATCH_DEFAULT_IOS_RICH_NOTIFICATIONS = false;

// Batch Rich Push
export const BATCH_TARGET_NAME = "ExpoBatchRichNotifications";
export const PODFILE_TARGET_MARKER = `target '${BATCH_TARGET_NAME}' do`;
export const PODFILE_SNIPPET = `\n\ntarget '${BATCH_TARGET_NAME}' do\n  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']\n  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']\n  pod 'BatchExtension'\nend\n`;
