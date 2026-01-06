UPCOMING
----

**Core**

- Added `enableIOSRichNotifications` configuration options to enable rich push notifications on iOS.


1.1.0
----

**Core**

- Introduced `androidSmallIconResourceId` and `androidNotificationsColor` configuration options for enhanced notification customization.
- Fixed an issue where expo prebuild would fail if the Batch API key was not configured.


1.0.0
----

This initial release introduces the Batch-Expo-Plugin, a config plugin designed to automatically set up the native configuration for the Batch React-Native-Plugin during the expo prebuild`.

**Migration**

Previously, Expo support was directly integrated into the Batch-React-Native-Plugin.
This support has now been removed and replaced by this dedicated plugin.
If you were using an older version, please see our [migration guide](https://doc.batch.com/react-native/advanced/11x-migration/) for more info on how to update your current Batch implementation.

**Requirements**

- Expo SDK 54 or higher
- `@batch.com/react-native-plugin` 12.0.0 or higher




