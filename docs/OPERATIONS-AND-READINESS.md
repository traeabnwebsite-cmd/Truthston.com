# Release and platform readiness

October 28, 2026 · C02 implementation

## Commands

- `npm run check`: source/types, native import boundaries, direct feature tests, SQL policy and local CMS tests.
- `npm run prepare:assets`: public static package and content-addressed code, retaining the previous known code tree. The manifest records current/retained code IDs, exact rollback revision and source Git revision.
- `node scripts/check-source.mjs public`: validate delivered native imports/asset references.
- `npm run preflight`: inspect configured environment isolation, current public/editorial inventory, missing retained code/icons and private-file leakage. No secrets or account tokens are read or reported. Returns nonzero on package/isolation defects; unimplemented commercial services are listed as pending, never promoted to ready because a binding exists.
- `npm run smoke:live -- https://www.truthston.com/`: read-only HTTP checks of release consistency, health, current/retained module URLs, app icons, protected routes and missing-asset404. Run for apex and www after deployment. This does not replace browser or real-device tests.

GitHub validation includes preflight after packaging. Production remains one Cloudflare Workers Builds pipeline triggered by main. Check GitHub and Cloudflare statuses before calling a release live. Do not deploy from the unrelated WebFaktory credential context.

## Current inventory

The generated `handoff/refactor/platform-readiness.json` is authoritative for the inspected checkout. The previous documents confused indexed versus displayed/published content. Current data has26 public readable articles versus150 editorial records (124 drafts);113 photo records curated into66 unique photographs;2 dated calendar records;7 published product concepts/listings;138 draft CMS project references and0 published CMS audio projects. The embedded sleeve catalog and the public Boss Ballin demonstration are separate from published multitrack projects. These counts are not an assertion that the entire music vault is connected.

`/api/health` reports public capability implementation states and the current static code release, with `Cache-Control:no-store`. Missing/invalid manifest metadata reports an unknown release rather than inventing one. Membership, cloud CMS, premium media, billing, verified stamps, reward fulfillment and recording remain unconfigured. Adding credentials by itself cannot change these states; implement and verify the respective slice first.

## Promotion and rollback

1. Finish the slice, review browser and automated evidence; package and run preflight.
2. Commit/push via the established main pipeline. Wait for both checks and Cloudflare success.
3. Read the public release manifest and health; run read-only smoke on both hostnames; browser-check affected interactions.
4. On failure, use Cloudflare’s previous deployed version or revert the code commit through GitHub and the same build pipeline. Keep the manifest’s pinned predecessor assets through the compatibility window. Do not roll a database schema backward destructively; migrations must be additive and backward compatible.
5. Record deployed source/code IDs, check results and outstanding device/provider gates in the handoff.

An isolated staging configuration exists with no public production routes. Actual staging D1/R2 provisioning, backups and cloud rollback rehearsal remain C04/C13 work; passing the config-isolation check alone does not demonstrate cloud persistence/recovery. Public content cache revocation and already-downloaded files need explicit retention decisions during production media work.

Reference: [Cloudflare Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/), reviewed for this operational change.
