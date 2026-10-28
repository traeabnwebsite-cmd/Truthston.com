/** Public operational facts, never inferred from browser demo state or a binding alone.
 * Update implementation states only after the corresponding service exists and passes
 * its acceptance gate. Merely adding D1/Stripe credentials must not advertise readiness.
 */
export const platformCapabilities = Object.freeze({
  publicContent: "published-snapshot",
  accounts: "not-configured",
  cloudCMS: "not-configured",
  premiumAudio: "not-configured",
  premiumVideo: "not-configured",
  billing: "not-configured",
  verifiedStamps: "not-configured",
  rewardFulfillment: "not-configured",
  merchCheckout: "external-provider",
  studioRecording: "not-configured",
});
