# Platform research and decision record

Prepared October 26, 2026. USD public list prices, not a vendor quote. Based on current primary vendor documentation retrieved for this job. Recommendations, cost scenarios and architecture choices below are our analysis. Recheck commercial terms and provisioning prices before launch.

## Recommendation

Keep Cloudflare as the platform: **Workers + Static Assets for the site and API, D1 for member records, private R2 for music and project files, and Stream for private video.** Use **Better Auth with D1** for customer authentication and **Stripe Checkout/Billing** for paid membership. GitHub holds source and deploy configuration, never the premium catalog. This keeps the existing build-free site and avoids a framework rewrite.

Cloudflare supplies infrastructure; it does not grant music rights, operate the fan-club business, or automatically supply customer login and payments. Better Auth is application software we operate. Stripe handles payments. These are distinct responsibilities.

Use an auth-provider adapter so Clerk can replace Better Auth without changing member IDs, stamps or subscriptions if managed authentication becomes the better operational choice. Use asset/provider IDs so Mux or Postgres can be added without rebuilding the experience.

## Can Apple Music, Spotify or Deezer supply the paid catalog?

| Source | What it can reasonably do | Why it is not our subscription backend |
|---|---|---|
| Apple Music / MusicKit | Optional playback for a visitor who authorizes their own Apple Music account; catalog browsing within Apple's permitted use | MusicKit serves the individual user's subscription. Apple's agreement prohibits charging for or indirectly monetizing Apple Music access and modifying its content. A site-wide consumer subscription is not a redistribution license. |
| Spotify | Optional outbound artist/album links; approved integrations under the applicable API/widget terms | Spotify's policy restricts commercial streaming integrations, requires Premium for SDK music streaming and prohibits mixing or overlapping tracks. It conflicts with our two-deck screw/chop feature. |
| Deezer | Links or a separately approved integration | Published developer/plugin terms restrict commercial use without approval. Obtain written terms for this specific model before relying on an integration. API availability and approval are not guaranteed. |
| YouTube | Free, permitted embedded public videos in the screening room | YouTube policies forbid charging to watch embedded content and rewarding YouTube viewing. Keep these videos outside the paid entitlement and Stamp Credit rules. |
| Artist/label-authorized masters | Our own protected playback, subscriptions, eligible downloads and authorized DJ behavior | Requires documented master and composition permissions, applicable territories and approved uses. This is the recommended catalog foundation. |

Sources: [Apple MusicKit](https://developer.apple.com/musickit/), [Apple agreement §3.3.10, MusicKit](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/), [Spotify Developer Policy](https://developer.spotify.com/policy), [Deezer developer terms](https://cdn-content.dzcdn.net/pdf/CGU-developers.pdf), [YouTube developer policies](https://developers.google.com/youtube/terms/developer-policies).

Buying personal subscriptions, even several of them, does not change those provider restrictions. Different site members may each connect their own provider account if a compliant optional integration is approved, but they would still need their own provider entitlement. Do not promise that our subscription includes Apple Music or Spotify. Do not extract their protected streams, download them into R2 or use them as Web Audio DJ buffers.

We should provide familiar external listening links where permitted, while selling our own authorized content and fan-club benefits independently. Do not create an Apple/Spotify connector at launch unless it adds enough value to justify its terms, account-linking and support burden.

## The rights distinction that changes the launch plan

The recording and the underlying song are separate works. Trae's involvement in the website does not by itself establish ownership of every older label master, guest contribution, sample, composition, video or photograph. For each asset, record its owner, agreement reference, streaming/download/DJ permissions, territory and dates. A public streaming link is not proof of ownership.

Have the artist's rights team determine the required direct licenses, composition performance/mechanical arrangements, royalty reporting and whether MLC participation applies. SoundExchange's statutory route for noninteractive radio does not substitute for on-demand interactive or download clearances. For DJ use, specifically authorize pitch changes, two-deck manipulation and any recording/sharing; launch with local interaction and no exported mixes unless cleared.

Sources: [US Copyright Office: musicians and the two copyrights](https://www.copyright.gov/engage/musicians/), [SoundExchange: licensing](https://www.soundexchange.com/service-provider/licensing-101/), [SoundExchange explanation of interactive/download exclusions](https://www.soundexchange.com/wp-content/uploads/2022/12/2023-Commercial-WebcasterMemo-Final.pdf), [The MLC](https://www.themlc.com/). This is a product implementation requirement; the artist's qualified advisers should establish the actual rights position.

## Hosting and server comparison

| Option | Strength for this project | Tradeoff | Decision |
|---|---|---|---|
| Cloudflare Workers + Static Assets | Same-origin static frontend and API; direct D1/R2 bindings; suits the existing HTML; integrates security and media products | Edge runtime requires compatible libraries; CPU-heavy media processing needs a separate processing worker/container service | **Recommended** |
| Vercel + a database + media providers | Strong framework deployment and preview tooling; good if a future React/Next.js product team wants it | Does not solve catalog storage/rights; would add vendors without a present frontend need | Viable, no migration benefit now |
| AWS S3/CloudFront + compute + managed database/auth | Broad managed services, mature media pipelines, regional controls | More services, IAM configuration and transfer-cost modeling for a small launch team | Reserve for contractual or media-scale requirements |
| A single rented VPS | Flexible conventional server runtime and local FFmpeg | Patching, scaling, backups, availability and media bandwidth become our responsibility | Poor default for a subscription launch |

Sources: [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Vercel pricing](https://vercel.com/pricing), [AWS S3 pricing dimensions](https://aws.amazon.com/s3/pricing/). The relative fit is our judgment, not a vendor benchmark.

There is no always-on server to maintain in the recommended request path. Workers run the backend on demand. Encoding is a background workload, not a long HTTP request through the website Worker.

## Database comparison

| Option | Fit | Constraint / operational consequence |
|---|---|---|
| D1 / SQLite | Profiles, stable catalog IDs, entitlements, stamps, inventory reservations and credit ledger in one Cloudflare deployment | Paid maximum **10 GB per database**; currently 30-day Time Travel. Do not store MP3s, videos or high-volume per-second analytics here. Plan indexes, retention, backups and eventual partitioning/migration. |
| Supabase / Postgres | Bundled auth, Postgres, RLS, storage and realtime; strong choice if social features and complex queries dominate | Additional platform; music delivery needs its own cost model. Pro currently starts at **$25/month**, with 100K MAU, 8 GB DB disk, 100 GB file storage and egress allocations; overages and extra projects add costs. |
| Neon / Postgres | Managed Postgres, useful if advanced SQL or portability becomes a priority; can retain R2 media | Separate database operations and network integration. Usage-based compute/storage; its advertised typical spend is not a fixed project quote. |

Sources: [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [Supabase pricing](https://supabase.com/pricing), [Neon pricing](https://neon.com/pricing).

**Decision:** D1 for launch, provided projected member/catalog/ledger data comfortably fits one database and load tests pass. Reassess at 5 GB actual database size, sustained write contention or the start of a substantial social graph. Those are engineering review triggers, not vendor hard limits. Prefer a deliberate Postgres migration over improvising cross-database financial transactions. Keep raw analytics out of the member database and retain only the evidence needed for rewards, disputes and reporting.

## Customer identity

| Approach | Benefit | Cost / responsibility |
|---|---|---|
| Better Auth on Workers/D1 | Keeps auth storage and runtime in Cloudflare; generated library schema, established session and verification flows | We operate updates, abuse controls, email delivery, recovery and monitoring. Open-source software is not a managed support contract. |
| Clerk | Managed auth and prebuilt account UI; reduces custom identity operations | Additional provider and usage-based charges. Current Hobby limit is 50K **monthly retained users**, not MAU; Pro shows $20/month billed annually, with additional retained users at published rates. Monthly billing differs. |
| Supabase Auth | Attractive with a Supabase Postgres decision | Adds little simplicity if D1 remains the application database; splitting identities across multiple stores adds synchronization work. |

Sources: [Better Auth database/migrations](https://better-auth.com/docs/concepts/database), [Better Auth changelog](https://better-auth.com/changelog), [Clerk current pricing](https://clerk.com/pricing).

**Decision:** retain the existing Better Auth + D1 direction. Generate its exact schema from a pinned, tested version rather than inventing auth tables. Use verified email links initially, optional social login only after configuration, and MFA for privileged accounts. Before public paid launch, if the team cannot own recovery, patching and security operations, switch this one boundary to Clerk. Do not let a wish for one vendor lead us to home-made password cryptography. Cloudflare Access is appropriate for staff/admin gates, not a replacement for the fan membership system.

Cloudflare Email Sending is currently marked Beta in the docs. Its Paid pricing lists 3,000 outbound emails/month then $0.35/1,000. Use it only after this account/domain has approved sending and deliverability is tested; keep a transactional-provider fallback such as Resend/SES behind an email adapter. Marketing mail is separate, opt-in, with unsubscribe handling. No messages have been sent. [Cloudflare Email Service](https://developers.cloudflare.com/email-service/platform/pricing/).

## Music storage and import

R2 Standard is a strong fit for frequently played audio: published storage is **$0.015/GB-month**, Class A operations **$4.50/million**, Class B **$0.36/million**, with direct Internet egress free. Worker requests, transformations and other services can still be charged. Free allowances and rounding apply. Do not put frequently read catalog audio into Infrequent Access just to get a lower headline storage price. [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

Backblaze B2 is worth considering for independent master backups: current published starting storage is **$6.95/TB/month**, with transfer allowances and partner-CDN options. It is not automatically the same private playback architecture as an R2 binding. AWS S3 is also viable where existing label infrastructure already uses it; model storage, requests and transfer/CDN costs together. [B2 pricing](https://www.backblaze.com/cloud-storage/pricing), [S3 pricing](https://aws.amazon.com/s3/pricing/).

**No, the owner does not need to click Upload separately for every song.** Preferred intake is a folder or project ZIP plus a manifest. The admin importer can upload many files, extract tags, reconcile ISRC/project/track order, show errors, retry only failed tracks and publish the approved batch. If masters are already in an authorized S3/B2 bucket, use a bulk migration/import. R2 documents SDK/CLI/multipart uploads and Super Slurper for supported source stores. An ordinary Apple/Spotify album URL is not such a source. [R2 upload methods](https://developers.cloudflare.com/r2/objects/upload-objects/), [Super Slurper](https://developers.cloudflare.com/r2/data-migration/super-slurper/).

Each track still needs a unique catalog record and playable file/rendition, but the software can create those records from a batch. Preserve masters privately, create streaming versions and waveform data in background jobs, and prepare only eligible project ZIPs. Never put private music in GitHub, public static assets, or an unrestricted bucket. An external label-owned origin can remain the source if its contract and technical access support independent licensed delivery; self-hosting every original byte is not inherently mandatory.

## Video and protection

Cloudflare Stream currently charges **$5 per 1,000 stored minutes/month** and **$1 per 1,000 delivered minutes**. Encoding/ingress are included in its described pricing. Delivery includes buffered/preloaded segments, so avoid eagerly loading every carousel video. Signed tokens restrict who can play a private asset; they are not a promise that screen recording or copying is impossible. [Stream pricing](https://developers.cloudflare.com/stream/pricing/), [Stream signed access](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/).

Mux is the strongest alternate to price-test. Its current pricing includes 100K free monthly delivery minutes and paid-plan usage credits, with quality/resolution and other billing dimensions; this can beat Stream for particular workloads. It offers a media-grade DRM add-on, currently listed at $100/month + $0.003/play. If a licensor requires DRM, evaluate an approved DRM solution rather than labeling signed URLs as DRM. No claim is made that DRM prevents all capture. [Mux pricing](https://www.mux.com/pricing).

**Decision:** Stream as the baseline because it matches the platform preference; benchmark Stream and Mux against the actual authorized video library and watch-time forecast before committing the catalog. Keep public YouTube videos free and embedding-compliant, separate from private paid videos.

## Billing and merchandise

Stripe Checkout creates the paid subscription, Stripe's portal handles customer billing changes/cancellation, and verified webhooks update server entitlements. The browser success page never grants access. Stripe Billing pay-as-you-go currently lists **0.7% of Billing volume**, in addition to applicable payment processing and other selected services. [Stripe Billing pricing](https://stripe.com/billing/pricing), [subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks), [Checkout](https://stripe.com/payments/checkout).

For apparel, first find out whether Trae's merch operation already has a store and fulfillment partner. If so, integrate that catalog/checkout instead of duplicating stock, tax, shipping and returns. Shopify is a strong physical-commerce option, but adds its own plan/API/checkout constraints and needs a verified member-linked discount bridge for Stamp Credit redemptions. A native Stripe-only physical store is possible but requires us to build more operations. Existing Bumpboxx product links remain external. [Shopify plans](https://www.shopify.com/pricing).

## Costs: examples with explicit assumptions

These are **partial infrastructure scenarios**, not a complete operating budget or membership-price recommendation. Before free allowances, rounding, taxes and extra usage; D1 assumed inside included Paid quotas. Workers shown at $5 base only. Add auth/email operations, background processing, Durable Objects, logs, backups, payment fees, staff, rights/royalties, refunds, merch/fulfillment and taxes.

| Scenario | R2 stored audio/files | Video stored | Monthly video delivery | Approx. R2 storage + Stream + Workers base |
|---|---:|---:|---:|---:|
| Small pilot | 20 GB / $0.30 | 5,000 min / $25 | 1,000 viewers × 20 min = 20K / $20 | **$50.30/month**, plus excluded items |
| Growing club | 200 GB / $3 | 5,000 min / $25 | 10,000 viewers × 120 min = 1.2M / $1,200 | **$1,233/month**, plus excluded items |

Formula: R2 stored GB × 0.015 + ceil(stored video minutes / 1000) × 5 + delivered video minutes / 1000 + 5. It omits operation overages and is not a billing calculator. Video consumption can dominate storage cost. For audio sizing, a 4-minute 256 kbps file is about 7.68 MB; 10K such renditions are about 76.8 GB. Lossless masters and extra renditions are additional. Ten thousand listeners each playing 300 minutes at that bitrate transfer about 5.76 TB; R2 egress is free under its published direct-delivery terms, but request and backend costs remain.

A discrepancy surfaced in Cloudflare documentation: the D1-specific pricing table currently lists $0.75/GB-month beyond included storage, while the aggregate Workers pricing page shows $0.20. Use the D1-specific table as the conservative planning reference and confirm the account's actual quoted billing rate. Do not present either as a guaranteed invoice. This discrepancy does not affect the examples, which assume D1 within the included storage allowance.

## Final selections and what is still a decision

- Recommended: Cloudflare hosting/backend/database/audio; Better Auth customer identity; Stripe digital billing.
- Conditional: Stream versus Mux after video-cost/DRM review; physical-commerce provider after existing merch operations are confirmed; production email after account eligibility/deliverability checks.
- Business decisions needed before activation: included projects and permissions, monthly/annual membership price, downloads included versus purchased, launch countries/ages, merch reward funding/stock and shipping responsibility, approving staff/affiliate identities, giveaway terms, audience/concurrency forecast and launch budget.
- No resources, subscriptions, licenses, vendor accounts or charges were created by this research job. The account pages and local Stamp Book remain explicitly marked as previews.
