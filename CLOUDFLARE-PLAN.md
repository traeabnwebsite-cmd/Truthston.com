# Trae Tha Truth — Cloudflare-first launch plan

> Updated decision record: [BUILD-SPEC.md](BUILD-SPEC.md) and [current platform research](docs/PLATFORM-RESEARCH.md) now govern implementation. The recommendation remains Cloudflare + D1 + R2 with Better Auth and Stripe. Stream/Mux video choice, production email and physical commerce have explicit review gates. No live accounts or billing are activated.

Prepared October 25, 2026. This repository is a local pitch prototype. No Cloudflare resources, customer accounts, subscriptions or payment charges have been created.

## Recommended stack

Use **Cloudflare Workers + Static Assets, D1, R2 and Stream**. Supabase is not required for the planned site.

| Need | Service | Purpose |
|---|---|---|
| Website and API | Workers + Static Assets | Serve the existing HTML/assets and membership endpoints together. No front-end framework migration required. |
| Member data | D1 | Profiles, entitlements, permanent stamps, credit ledger, rewards and redemptions. Audio/video files do not belong in the SQL database. |
| Music, project downloads, artwork | Private R2 buckets | Keep large media outside GitHub; deliver protected files through an authenticated Worker or short-lived authorized URL. |
| Premium video | Cloudflare Stream | Encoding, adaptive playback and restricted signed playback tokens. |
| Consumer sign-in | Better Auth in Workers, backed by D1 through Drizzle/SQLite | Keeps the authentication service in the Cloudflare deployment. Add verified email/passkeys/social sign-in with supported auth tooling; do not invent password/session code. |
| Payments | Stripe Checkout + verified webhooks | Membership subscriptions, project purchases and merchandise checkout. Keep card handling in hosted checkout. |
| Transactional messages | A configured email service | Account verification, receipts and order updates. Choose/configure this when activating accounts. |

[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) supports this shared static/API arrangement. [Better Auth's Drizzle adapter](https://better-auth.com/docs/adapters/drizzle) supports SQLite adapters; the production auth schema must be generated using the selected library version. Cloudflare Access is for protected workforce/app access, not the customer membership system proposed here.

## Storage and operating costs

Current public list prices, excluding taxes, free allowances, payment fees and usage overages:

- R2 Standard storage: **$0.015 per GB-month**, plus operation charges; Internet egress is free. About **1,000 GB costs $15/month for storage alone** before free allowances. [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- Workers Paid starts with a **$5 monthly subscription**, with included usage and additional usage charges. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- Stream storage is **$5 per 1,000 stored minutes per month**; delivery is **$1 per 1,000 delivered minutes**. Example: 5,000 minutes stored and 100,000 minutes delivered is $125 in Stream usage. [Stream pricing](https://developers.cloudflare.com/stream/pricing/)
- D1 includes usage allocations, then charges for storage/reads/writes. See the product's current table when provisioning. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)

Storage is likely inexpensive compared with popular video playback. Forecast video viewing minutes and set billing alerts before launch. Recheck prices when opening the production account.

## Membership and paid media flow

1. Better Auth verifies the consumer and establishes a secure session.
2. Stripe Checkout starts the subscription or purchase.
3. The Worker verifies the webhook signature against the raw request body and records each provider event ID once.
4. D1 grants or revokes entitlements based on the verified payment state.
5. Every protected audio/download/video request checks the session and entitlement on the server. Paid R2 buckets remain private; do not enable public `r2.dev` access for them.
6. The server issues short-lived Stream playback tokens or serves R2 objects with range requests. [Signed Stream access](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/)

Public YouTube embeds remain useful free previews. A page paywall cannot turn an openly accessible YouTube video into protected premium media. Use your authorized private masters in Stream for exclusive paid videos. The supplied Boss Ballin file is explicitly the prototype's public sample; do not put the full paid catalog under public static assets.

## Stamps and rewards

Collectible stamps stay permanently in a member's Stamp Book. A separate Stamp Credit ledger records spendable value. Activity awards must use server-validated qualifying events and unique event keys; the browser cannot choose an award amount or submit an authoritative balance.

The included SQL migration provides member/stamp tables, unique earned awards, append-only credits, an overdraft-prevention trigger, entitlements and redemption records. Real redemption must atomically reserve stock, debit credits and create a redemption with an idempotency key. A cancelled reward uses a compensating credit entry; never delete ledger history. ABN/affiliate approval stamps require a verified staff/affiliate action.

Keep giveaways configured separately with explicit eligibility, dates and fulfillment. No giveaway is active in this prototype. The browser Stamp Book/rewards preview is illustrative device-local state, not a spendable member account.

## Repository and deployment files

- `index.html` + `assets/`: run directly through any local static server, with no front-end build.
- `wrangler.jsonc`: deployable static prototype + API shell, using October 25 compatibility date.
- `cloudflare/worker.mjs`: health endpoint, static assets binding and fail-closed unconfigured membership/payment/media routes.
- `migrations/0001_memberships_and_rewards.sql`: future D1 schema.
- `scripts/prepare-assets.mjs`: copies only HTML and assets into generated `public/`. Research, handoffs, secrets and Git metadata are excluded.
- `.github/workflows/check.yml`: checks on push/PR.
- `.github/workflows/deploy-cloudflare.yml`: manual preview deployment, requiring configured Cloudflare secrets and GitHub's `preview` environment.

The deployment shell is not a completed auth/payment backend. Its member, checkout and premium routes return 503 until implemented/configured; no route accepts browser stamp balances.

## Connect GitHub and Cloudflare

1. Put this repository in the intended GitHub account, preferably private during the pitch.
2. Run `npm ci` and `npm run check`.
3. For Cloudflare-style local testing, run `npm run dev:cloudflare`. The existing Python preview/launcher still works without npm.
4. Configure the `CLOUDFLARE_ACCOUNT_ID` and a scoped `CLOUDFLARE_API_TOKEN` as GitHub secrets. Use the `preview` environment for deployment approvals/settings if desired. No credentials belong in source.
5. Trigger the manual Cloudflare workflow when ready to publish a preview. Alternatively, after authenticating Wrangler, run `npm run deploy:preview` yourself.
6. Create the production D1 database/private R2 bucket and add their returned identifiers as bindings. Generate the auth schema and configure secrets, email and Stripe test mode before enabling member flows.

Example binding additions (not active in the prototype config):

```json
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "trae-members",
    "database_id": "REPLACE_WITH_RETURNED_D1_ID",
    "migrations_dir": "migrations"
  }],
  "r2_buckets": [{
    "binding": "MEDIA",
    "bucket_name": "trae-private-media"
  }]
}
```

After binding configuration, generate types with `npm run types`. Apply migrations to a local database before any remote migration. Configure auth/payment credentials through Wrangler secrets or CI secrets, never through a browser-visible config object.

## October 27 publishing / account connection update

Use docs/CONNECT-ACCOUNTS.md for additive account setup and docs/CMS-GUIDE.md for current publishing boundaries. The existing terminal API token points to the older WebFaktory account, so do not run a real deployment with that environment. Set the Trae account/token as repository CI secrets instead. GitHub import push awaits Trae write authorization. The local editor persists on disk; cloud publishing is fail-closed until staff identity, D1/R2 and commerce adapters are implemented. The sanitized public content snapshot can deploy now once the correct accounts are connected. Public output excludes MP3 masters.

Current status: authorization and public-preview deployment are complete. Use docs/DEPLOYMENT-STATUS.md; the older account-connection blockers above are historical. Cloudflare Workers Builds is the active automatic pipeline.
