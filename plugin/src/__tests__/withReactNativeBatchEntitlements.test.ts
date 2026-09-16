import { withReactNativeBatchEntitlements } from "../withReactNativeBatchEntitlements";

/**
 * Runs the entitlements mod the way a prebuild does. Expo merges the
 * `ios.entitlements` of the app config into the entitlements plist before any
 * plugin mod runs, so whatever is already in modResults is what the user, or
 * another plugin, asked for.
 */
const prebuild = async (
  entitlements: Record<string, unknown> = {},
): Promise<Record<string, unknown>> => {
  let config: any = { name: "test", slug: "test", mods: {} };
  config = withReactNativeBatchEntitlements(config);
  config = await config.mods.ios.entitlements({
    ...config,
    modResults: { ...entitlements },
    modRequest: {
      projectRoot: "/app",
      platformProjectRoot: "/app/ios",
      platform: "ios",
      modName: "entitlements",
      introspect: false,
    },
  });
  return config.modResults;
};

describe("withReactNativeBatchEntitlements", () => {
  it("adds the development aps-environment when there is none", async () => {
    await expect(prebuild()).resolves.toEqual({
      "aps-environment": "development",
    });
  });

  it("keeps the aps-environment of the app config", async () => {
    // Xcode rewrites the entitlement to production when archiving a release
    // build, so this is rarely needed, but overwriting it silently sent apps
    // that do set it to the wrong APNs environment.
    await expect(
      prebuild({ "aps-environment": "production" }),
    ).resolves.toEqual({ "aps-environment": "production" });
  });

  it("leaves the other entitlements alone", async () => {
    await expect(
      prebuild({
        "com.apple.security.application-groups": ["group.com.test.app"],
      }),
    ).resolves.toEqual({
      "com.apple.security.application-groups": ["group.com.test.app"],
      "aps-environment": "development",
    });
  });
});
