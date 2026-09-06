/**
 * Feature flags configuration.
 *
 * Use feature flags to safely roll out new functionality,
 * run A/B tests, or toggle experimental features.
 *
 * For production, consider integrating with a service like LaunchDarkly,
 * Statsig, Unleash, or PostHog for dynamic feature flags.
 *
 * @example
 * import { featureFlags } from '@/configs/featureFlags';
 *
 * if (featureFlags.isEnabled('newCheckout')) {
 *   return <NewCheckout />;
 * }
 */

type FeatureFlagKey = keyof typeof flags;

const flags = {
  /** Demo: gates the Redux-backed banner on the home page (see DemoBanner). */
  demoBanner: true,
  // Add feature flags here:
  // newCheckout: process.env.NODE_ENV === 'development',
  // darkModeV2: true,
} as const satisfies Record<string, boolean>;

export const featureFlags = {
  /** Check if a feature flag is enabled. */
  isEnabled(flag: FeatureFlagKey): boolean {
    return flags[flag] ?? false;
  },

  /** Get all flag values (useful for analytics/debugging). */
  getAll(): Readonly<typeof flags> {
    return flags;
  },
};
