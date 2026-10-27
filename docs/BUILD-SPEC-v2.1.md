# Trae Tha Truth — website build specification

Version 2.1 · October 27, 2026 · Owner review draft, with implemented prototype baseline.

This supersedes earlier planning notes where they conflict. Read [the platform research](docs/PLATFORM-RESEARCH.md) for current service comparisons, prices and music-provider restrictions. Read [the membership contract](docs/MEMBERSHIP-AND-STAMPS.md) for earning and redemption behavior. “Implemented” below means local prototype or tested foundation, not a deployed commercial service.

## 1. Product and visual direction

An artist-owned destination for music, Houston history, video, community, apparel and membership. Artist/site: **Trae Tha Truth**. Record shop: **ABN Records, CDs and Tapes**. Main tagline: **Tha Truth & Nothing but Tha Truth**. Membership invitation: **Join the site. Get stamped. Get approved.** Supporting invitations may mention Trae, Guerilla Maab and ABN affiliates, but official personal approval requires a verified award.

Retain the cream paper, black ink, brick red #c3321d, amber #d9902b and deep green #2c5a46 palette; worn print texture, sharp labels and stamped condensed type. The immersive world is an animated Houston interpretation. It is not a surveyed full-scale digital twin or a GTA-quality game engine. Preserve the approved art direction while improving detail and continuity where needed.

The current single-file HTML must continue to run from a normal local web server with no frontend build. Production backend deployment may bundle its own server code. Do not rewrite the frontend into a framework solely to add accounts.

## 2. Audited baseline: what exists

| Area | Implemented locally | Production work still needed |
|---|---|---|
| Modes and room | Standard release grid; immersive Three.js 0.160.1 room; reduced-motion/Calm; orbit/station navigation; fullscreen controls | Complete device/performance/accessibility audit; preserve fallback when WebGL/CDN is unavailable |
| Music catalog | 138 releases with distinct artwork, tracklists where available, release overlays and canvas share cards | Reconcile authoritative release/track IDs, dates, credits, rights and actual files; current fallback/sample data must be labeled or removed from live claims |
| Audio and player | Supplied Boss Ballin MP3, playback/progress/volume/headphones; Web Audio analysis and visual response | Protected ordinary streaming, catalog queues, entitlement handling, media-session controls and actual per-track audio |
| DJ room | Separate acoustic room; two decks use the same record, beat-offset B deck, linked pitch, crossfader/cuts, forward/reverse scratch; fitted speakers and Bumpboxx models | Only authorized DJ tracks; validated beat grids, memory limits, device testing and no exports unless cleared |
| Shop/merch | ABN branding, apparel/accessory racks; Bumpboxx links to a product page and external official store; apparel concepts/wishlist | Approved SKUs, imagery, sizes, inventory, fulfillment, tax, returns and checkout integration |
| Theater | Projector POV, 13 video choices including Strapped Up, in-room YouTube playback, lights, seated rear-view companion/popcorn, end suggestion, hover-revealed horizontal film strip, room fullscreen | Approved uploads; public YouTube free; signed private video for premium use; captions and embed/third-party privacy audit |
| Theater sightline | Screen enlarged to 9 × 5.0625 at y=4.05; projector eye y=4.15; head below image | Preserve this requested sightline across supported desktop aspect ratios |
| City | Houston skyline interpretation, connected streets/freeways, raised Be Someone span, hanging years, storefronts, store exterior and vehicles | Continue parcel/road conflict and far-clip audit, artist/location review and consistent detail/performance |
| Landmarks | Reliant/NRG with entrance/sign/retracting roof; Astrodome, Astros ballpark/slow roof/Daikin graphic, Rockets arena/court, dark Transco plus immediate Waterwall/Galleria/Westin/arch context; team marks | Final likeness/colors/branding approval and asset permissions review before public launch |
| Archive/giving | 29 embedded timeline entries; date panel and year selection; giving map/pins and concept ledger | Editorial source review; giving ledger must not imply live fundraising; actual event/service links |
| Living details | Local simulated room visitors, collective meter, daily dig, ink effect, beat response and restrained glitches | Do not imply global counters or shared balances before backend integration; motion/flash audit |
| Companion | Approved illustrated black-tee character, diamonds, compact thought cloud and action pill, drag, local guide/chat, browser voice support; doorway and in-room routes | Keep illustrated art. Optional Workers AI implementation exists but is not configured. No cloned artist voice. Microphone support and moderation need real-device QA |
| Rejected 3D experiment | Separate `companion-3d.html` experiment was rejected by the owner | Do not integrate or publish that character. A future faithful 3D asset is separate work |
| Account area | Dashboard, Stamp Book, membership plans, library/favorites, rewards/ledger, proposed community and settings, all device-local | Real authentication, cross-device data, purchases, entitlements and privacy controls |
| Engineering foundation | Worker shell, health/static/optional companion route, fail-closed member/payment/media routes, CI/deploy skeleton, schema and domain tests | Real bindings, auth middleware, business APIs, Stripe test flows, private delivery, operations and deployment |

The current HTML is below the 2 MB source limit; images/audio are external local assets. The 138 sleeves are a metadata/artwork catalog, not 138 uploaded playable projects. Boss Ballin is the one public prototype preview across releases. The original `research/catalog/music_catalog_final.json`, videos and news vault was referenced by the owner, but no `research/` directory is present in this checkout; do not claim a fresh vault reconciliation occurred in this job.

## 3. Service architecture and boundaries

### Chosen direction

- **Hosting/CDN/API:** Cloudflare Workers + Static Assets, custom domain and TLS in Cloudflare.
- **Application database:** D1. Store members, roles, stamp definitions, awards, credits, rewards, subscriptions and media metadata. Keep files in object/video storage.
- **Customer identity:** Better Auth on Workers with D1, exact schema generated from its pinned release. A provider adapter permits a future Clerk change. Do not hand-code password/session cryptography.
- **Music/downloads:** private R2 Standard buckets; separate ingest/master and playable/published areas. Public artwork/previews have their own explicit publication path.
- **Premium video:** Stream baseline, Mux comparison before catalog commitment; use a DRM-capable option if required by contracts.
- **Billing:** Stripe hosted Checkout and customer portal, verified webhooks and server entitlements.
- **Email:** Cloudflare Email Sending if account/domain approval and deliverability pass; fallback transactional adapter. No dependency on an unavailable Beta capability for account recovery.
- **Coordination:** a Durable Object per member for playback lease admission if required for the one-session policy. D1 remains the sole authoritative credit ledger.
- **Background work:** Queues/Workflows coordinate imports and retries; actual audio decoding/encoding runs in compatible batch/container compute, not the ordinary website Worker request.
- **Physical commerce:** first integrate the artist's existing merch/fulfillment system if available; otherwise select Shopify or a separately scoped store. Keep Bumpboxx external purchasing honest.

Request flow: browser → Worker → identity validation → member status/entitlement/rights check → D1/lease decision → authorized media response or playback token. Never expose service credentials or a public premium bucket. A private filename alone is not access control. See [Cloudflare R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) and [Stream access controls](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/).

## 4. Membership and account experience

### Launch tiers

| Role/tier | Access |
|---|---|
| Visitor | Public artist pages, permitted previews/videos, Standard/immersive city and shop, join invitation |
| The Family — free verified member | Stamp Book, saved projects, eligible activity awards, published free challenges; same public media rights |
| The ABN Vault — proposed paid member | Only the authorized included music/private videos, eligible downloads and announced early-access benefits |
| Purchaser | Independent per-project entitlement where projects are sold separately; does not automatically imply a Vault subscription |
| Staff/affiliate | Specific administrative or award permissions, independent of paid tier |

No price, trial, founding lifetime plan or launch date is approved. `priceCents: null` and inactive paid plan are intentional. Do not show a working payment CTA until approved products, price IDs, included catalog and terms exist. A paid plan does not buy official stamps or guaranteed giveaway winnings.

### Pages and states

1. **Join / sign in:** verified email link, expiry/retry/error states, optional configured social provider, terms/privacy links, separate marketing consent. Redirect back to the intended sleeve/video/account route after sign-in. Existing local display-name entry is explicitly a preview, not authentication.
2. **My account:** member passport, current tier, permanent-stamp count, available credits, next milestone, recent account activity and links to library/billing.
3. **Stamp Book:** earned/locked/revoked-annotated collectibles, requirements, progress, date, issuer and campaign/project identity. Public book is private by default and explicitly opt-in.
4. **Membership:** included benefits and exclusions, price/renewal period, entitlement state, upgrade and billing portal; free, pending checkout, active, cancel-at-period-end, payment failure and ended states.
5. **My library:** separate owned, included, saved and recently browsed projects. Show downloads only when allowed. Browsing a sleeve is never a purchase. Ending membership removes included access at the proper time while purchased entitlements follow their own terms.
6. **Rewards:** available credits, published stock/eligibility, preview of total redemption cost and shipping conditions, confirmation, reserved/fulfilled/cancelled order history and credit ledger. No cash-out.
7. **Community:** launch with editorial challenges/polls only after admin tools are ready. Following, public books, listening rooms and mix submissions are later increments, each with moderation/reporting controls.
8. **Settings:** display name, avatar if approved, privacy/public-book setting, notification consent, email/security provider UI, sessions/devices, data export and account deletion request. Show verification and failure states honestly.

Local routes now use `#account/overview`, `/stamp-book`, `/membership`, `/library`, `/rewards`, `/community`, `/settings` after the hash. Keep direct links and browser Back working. Production can promote them to real routes without changing the information architecture. No preview balances, awards, staff status or entitlements are automatically imported into real accounts. Optional favorite/display-name migration requires an explicit nonfinancial import.

Visual treatment: existing paper/red headline system, green member passport, numbered navigation, printed ledger and ink stamp impressions. Responsive cards stack on phones. Forms have real labels, keyboard focus and status messages. The companion must not obstruct account actions; it remains movable.

## 5. Stamp system

Authoritative configuration is `assets/config/membership-policy.json`, consumed by the preview and internal policy module. Each rule has a stable canonical key, version, source, threshold, credit award and repetition rule. Display IDs retain compatibility with the local prototype.

| Stamp | Production qualification | Credit award | Frequency |
|---|---|---:|---|
| The Truth | 60 qualifying listening seconds from authorized, bounded playback receipts | 40 | Once per member |
| Crate Digger | Five distinct release views, ≥8 qualifying seconds each | 50 | Once per member |
| Street Certified | Four distinct landmark views, ≥5 qualifying seconds each | 30 | Once per member |
| Chopped In | Four manual cuts during an authorized DJ session; automatic chopping excluded | 25 | Once per member |
| ABN Approved | Recorded grant by an active `abn_approver` | 0 | Once, official |
| Guerilla Maab | Recorded grant by an active `maab_approver` | 0 | Once, official |
| Project title | Entitlement checked and delivery begins for an eligible full-project download | 0 initially | One distinct stamp per project |

These initial credit values are proposed configuration preserved from the prototype; owner approval and reward economics are required before they have real redemption value. The four activity awards total 145 credits once, not an endless earning loop. Project-specific stamps use stable IDs such as `project:<projectId>` and retain the project name/artwork. A download ticket alone is insufficient; server-observed delivery must start. We cannot reliably prove that every byte was saved on a user's disk, so never describe that event as verified full download completion.

Later weekly hunts, approved events, member anniversaries and service check-ins may add noncompetitive collectibles. Campaigns are inactive until rules, issuance budget, dates and evidence validators exist. A proposed 100-credit/day limit applies to **future repeatable campaigns only**, not these once-only founding milestones. Use the Houston calendar with timezone/DST tests. No credits for donations, clicking ads, buying approval, or watching third-party YouTube/Spotify/Apple content.

Qualifying behavior is verified by the server as far as practical; it is not proof of human attention. Client signals such as visibility/audibility are advisory. Use signed session nonces, server elapsed time, seek-jump limits, heartbeat sequence keys, rate limits and anomaly detection. Do not store one ledger entry per playback second. Minimize/expire raw receipts after aggregation and retention requirements are satisfied.

## 6. Credits, rewards and giveaways

A stamp remains a collectible when credits are spent. The immutable ledger, not a browser counter or KV cache, is authoritative. Award identity is member + stamp/project + rule version; a retry does not create another credit. Definition/version changes require an explicit grandfathering policy, not automatic re-awarding.

Redemption must perform validation, fixed cost lookup, stock reservation, debit and redemption creation in one database transaction. The SQL migration includes stock and matching-debit guards; D1 callers must use an atomic batch, not independent writes. Concurrent requests cannot overspend or reserve the final item twice. Failed reservations must leave no debit. A reserved cancellation generates one compensating credit and stock restoration; fulfilled-return handling belongs in a distinct audited workflow. Never edit old ledger rows.

Merch credit is a program unit, not dollars, stored value or transferable currency. Do not state a conversion rate until a funded reward and terms are approved. Published offers need SKU/size eligibility, stock, region, shipping/tax obligations, expiry and cancellation rules. A provider coupon must be member-bound, single-use and confirmed before a redemption is marked fulfilled. If coupon creation fails, retain a recoverable pending state or compensate exactly once; do not silently lose credits.

Giveaways are separate from redemption. Define sponsor, dates/timezone, territory/age, eligible stamps, entry method, any required alternative free entry, selection procedure, prize/fulfillment and privacy terms with the organizer's advisers. Membership or stamp collection must not imply a guaranteed prize. Store eligibility snapshots and entry uniqueness; never draw winners from browser state. No giveaway is active in this prototype.

## 7. Catalog and bulk media operations

The owner should supply authorized project folders or master exports plus metadata; a staff operator can import a full release or catalog batch. An Apple/Spotify/Deezer URL can be a permitted external reference, not a downloadable master source. A label-owned licensed origin may be ingested or used directly under its agreement.

Minimum records:

- **Project:** stable ID, title, type, release date/precision, artwork/alt text, editorial copy, provider links, ordered track IDs, publication state.
- **Track:** stable ID, project/order, title, duration, explicit flag, ISRC if available, master/rendition references, waveform/beat grid when approved, streaming/download/DJ flags.
- **Rights:** master owner, composition status, agreement reference, approved uses, territories, start/end and approving staff identity. Unknown rights default to unpublished/unplayable.
- **Video:** provider, asset ID, title, captions, thumbnail, public/free versus private premium, embedding permission and rights.

Intake states: draft → uploading → validating → processing → editorial/rights review → ready → published. Failures are resumable and isolated per file. SHA-256 checksums and stable IDs prevent duplicate uploads. File names alone are insufficient deduplication.

Launch intake can be an operator-assisted bulk tool, followed by an admin batch dashboard. Support multiselect/folder/ZIP; provide a CSV or JSON manifest, tag extraction and an error report before publication. ZIP extraction and malware/type validation happen in bounded background processing with zip-bomb/path-traversal protection. Use resumable/multipart direct object uploads scoped by admin permission and job ID; do not buffer large masters in the public request Worker.

Preserve originals privately, create ordinary streaming renditions and short preview assets with their own permission, normalize metadata, prepare eligible project ZIPs and review waveform/beat analysis. Transcoding creates new renditions, never overwrites originals. Import from approved origins uses service credentials and host allowlists to prevent SSRF; it is not an arbitrary public URL downloader. See [media intake specification](docs/MEDIA-INGEST.md).

## 8. Playback and concurrency

Every member can choose their own song independently. One stored track can serve many authorized users concurrently; there is no need for a separate uploaded copy or consumer music subscription per listener. Capacity still needs realistic peak-load tests.

Proposed policy: one active playback session per member, with two DJ decks counted as **one** session. The same buffer can feed both decks at their beat offset. Starting a second device offers explicit takeover; old lease/tokens expire promptly. Entering video pauses local music and changes the session mode. Downloads use separate short-lived grants. Device registration limits are not yet a product commitment.

Ordinary audio uses streamed range requests, correct 200/206/416 behavior, content length/type/ETag, seek, short authorization lifetime and bounded refresh. Avoid a cache that authorizes one user and then publicly serves the response to everyone. No public master URL or unrestricted `r2.dev` endpoint for protected catalog files. Signed access reduces unauthorized retrieval; it cannot stop every recording or copy.

DJ playback uses only explicitly eligible files, bounded per-track loading and Web Audio DSP. Decoded stereo PCM can consume around 106 MB for five minutes at 44.1 kHz, before reverse buffers and graphics. Profile memory; do not decode whole projects or promise a two-deck mobile experience until tested. Use short scratch windows/downsampled previews or a simpler phone mode if necessary. No third-party provider audio is routed into the DJ engine.

The public YouTube theater remains free and does not earn viewing credits. Private premium videos use Stream/Mux asset tokens after access checks. Keep theater geometry, higher sightline, dimming, carousel, exit controls and companion behavior independent of player provider. Never hide YouTube controls/branding contrary to platform rules; the current theater composition needs a final compliance audit before launch.

## 9. Backend model and API contracts

Implemented migrations cover members, stamp definitions/awards, ledger/balance, rewards/redemptions, entitlements, payment events, media assets, scoped roles/official approvals, activity receipts, revocations, plans/subscriptions, playback sessions, download grants, ingest jobs, rights records, library and audit history. Better Auth tables must be generated separately. Full project/track/editorial/order/fulfillment/giveaway models and processing outbox are still implementation work, not silently claimed as complete.

Planned authenticated routes:

| Route | Required behavior |
|---|---|
| `/api/auth/*` | Library-managed verified customer sign-in/recovery/session behavior |
| `GET /api/member` | Own profile, tier and consent; no cross-member leakage |
| `GET /api/member/stamps`, `/credits`, `/library` | Server records/progress; paginate histories |
| `POST /api/activity/*` | Bounded raw signals only; validator creates trusted receipts, never accepts an authoritative balance or credit amount |
| `POST /api/playback/session` | Check account, rights and entitlement, acquire lease, return restricted playback authorization |
| `GET /api/media/:assetId` | Enforce authorization and range semantics or issue bounded private-provider token |
| `POST /api/downloads/:projectId` | Check purchase/inclusion/territory, issue expiring grant, observe delivery start |
| `POST /api/rewards/:id/redeem` | Same-origin/CSRF and idempotency; atomic stock/debit/record |
| `POST /api/checkout` | Server-owned plan/price IDs; prevent duplicate subscriptions |
| `POST /api/billing/portal` | Own Stripe customer only; allowed return origin |
| `POST /api/webhooks/stripe` | Raw-body signature verification, durable dedupe/retry and reconciliation |
| `/api/admin/*` | Role-scoped catalog/import/award/fulfillment/audit actions; staff MFA and reauthentication for sensitive changes |

Use 401 unauthenticated, 403 unauthorized, 404 for inaccessible resources where appropriate, 409 conflict, 429 rate limit and explicit retry/unavailable states. Current protected routes intentionally return 503 because they are not connected. The internal `evaluateStampAward` function is **not** an HTTP security boundary: only feed it server-validated/DB evidence after identity checks. Do not expose a route that trusts its input-shaped receipt objects.

Billing flow: Checkout → verified webhook → current provider subscription reconciliation → atomic membership/entitlement update → UI refresh. Retries/out-of-order events must not duplicate grants or roll an active state backward. Record an event processed only after durable processing succeeds; use retryable outbox/queue records. A success redirect alone grants nothing. Cancellation normally retains paid access until the approved paid-through date. Payment failures, grace periods, refunds and chargebacks need explicit terms and tests. Use Stripe test mode before live prices. See [Stripe subscription events](https://docs.stripe.com/billing/subscriptions/webhooks).

## 10. Administration and editorial workflow

Staff dashboard: catalog/import queue, unpublished rights issues, subscription support view, reward stock/fulfillment, scoped official stamp grants, campaign scheduling, reports/moderation and append-only audit. Member identity must never be based on editable display names or profile metadata. Bootstrap staff roles through a restricted migration/admin operation; ordinary customers cannot grant roles.

Publish/unpublish must atomically update playable catalog eligibility and invalidate access. Expired/restricted tracks cannot be revived through stale token refresh. Scheduled drops use server time and explicit timezone. Provide support for duplicate-account resolution and mistaken award review without arbitrary balance edits.

Community launch is staged: editorial challenges → polls/public books with opt-in → moderated posts/listening rooms → approved mix sharing. Block/report tools, rate limits, moderator workflows, age rules and data retention precede unrestricted user-generated content. The companion may explain catalog/site features and link allowed destinations; it cannot invent sales, legal eligibility, official approval or account balances.

## 11. Privacy, operations and quality

- HTTPS, secure HttpOnly cookies, same-site/CSRF controls, allowlisted redirect origins, CSP appropriate to Three.js/fonts/YouTube/identity providers, rate limits and Turnstile on abuse-prone flows.
- Secrets only in vendor secret stores; server tokens never in public config, source, screenshots or logs. Separate dev, staging and production credentials/databases/buckets/payment modes.
- Collect minimal identity data; public books expose only consented display identity/stamps. Export/delete requests, financial retention and anonymized permanent histories need a documented policy.
- Back up D1 and manifests, retain independent master backups, and rehearse restore. Monitor media failures, auth email failures, webhook backlog, reward stock, ledger reconciliation and spend. Audit privileged actions.
- No surprise autoplay. Respect reduced motion. Preserve visible focus, captions, keyboard HTML twins and Standard mode. Test flash limits; audit every meaningful 3D action for an accessible equivalent.
- Performance targets to validate: usable Standard mode on a midrange phone, defer immersive assets until needed, no WebGL rendering on hidden/account tabs, adaptive pixel ratio, stable fullscreen controls, acceptable frame rate/memory under audio/video load. Do not claim GTA-level fidelity or production SLOs based on desktop screenshots.
- Do not bundle all audio/video or analytics into D1. Do not scan the whole member ledger on every playback heartbeat; use appropriate aggregates/indexes and reconcile them against immutable records.

## 12. Build order and acceptance gates

Finish and validate each stage before starting the next, per the owner's instruction.

| Stage | Deliverable | Gate to proceed |
|---|---|---|
| A — this job | Research/stack recommendation, this full spec, account designs, versioned stamp policy and additive DB/domain foundation | Local checks and reviewable preview; no real account/billing activation claimed |
| B | Confirm catalog rights, business tiers/prices, fulfillment and launch regions; reconcile stable metadata | Signed-off content/benefit matrix and reward economics |
| C | GitHub + Cloudflare dev/staging setup; real identity/email; own-account API and recovery | Signup/verification/sign-in/logout/session revoke, authorization negatives and recovery tested |
| D | Server receipt validators, DB award service, ledger/redemption endpoints and admin approval flow | Retry/race/forgery/scoped-role/stock/refund tests pass on D1; local preview credits never imported |
| E | Bulk ingest/metadata/rights/admin processing and protected audio/downloads | Authorized test project imports as batch, seek/range/expiry/revocation/concurrency tests pass |
| F | Stripe test subscriptions/purchases, reconciliation and member portal | Successful/failed/duplicate/out-of-order payment events and cancellation/refund tests pass; success URL cannot grant access |
| G | Private video, finalized theater, approved merch catalog/fulfillment/reward integration | Private/public separation, captions, coupon/stock/order/return tests and cost review |
| H | Accessibility/security/device/load/restore/editorial QA, approved policies and support | Owner launch approval and operational rehearsal |
| I | Controlled production launch, small invited cohort, monitored expansion | Actual costs, errors, retention and fulfillment reviewed before scaling |

Post-launch backlog: live synchronized rooms, following/public books, additional community content, richer challenges, optional provider connectors, faithful custom 3D companion if separately commissioned. These do not block the initial paid catalog launch unless explicitly made launch requirements.

## 13. Handoff and implementation status

Source: `/Users/brandonhughes/Documents/ChatGPT/Trae Tha Truth`. Delivery: `/Users/brandonhughes/Documents/Trae Website`. Local previews use ports 8765 and 8766. Keep source, config, migrations, docs and delivery synchronized. Private docs/research never enter the generated `public/` deployment folder.

Current foundation: `assets/config/membership-policy.json`, `cloudflare/membership-policy.mjs`, both SQL migrations, policy tests and schema tests. The Worker shell still fails closed for auth, billing, rewards and protected media. No cloud resources, consumer accounts, real rewards, email, subscription or private catalog have been activated. Current account/name/preferences/favorites and prototype credit ledger remain device-local.

See `CLAUDE-HANDOFF.md`, `WORK-QUEUE.md`, `COMPANION.md` and `THEATER.md` for continuity and the owner's rejected/approved visual directions. Where old docs describe a vertical theater carousel or a pending earlier visual check, the newer theater and this specification take precedence.

## 16. Editorial, media library and merch publishing — implemented local scope

The ABN Journal is a newspaper-style newsroom with dated source-linked briefs, article pages, section/year-text search and archive pagination. Current events distinguish confirmed upcoming dates from past dates. Gallery uses 113 acquired photos, collections, captions, credits and full-size keyboard navigation. Home/site copy is configurable.

The loopback Python CMS implements persistent disk-backed create/edit/draft/publish/schedule, optimistic revisions and local audit/history. It covers articles, events, photos, music projects and merchandise. MP3s upload in chunks with offset/size/signature checks, track ordering, BPM/access metadata and private storage. Public projects have real byte-range audio delivery; members/purchases are blocked until identity/entitlements exist. Current DJ demo does not yet switch to uploaded catalog projects.

Merch editor covers photos, descriptions, category, price in cents, sizes/options, stock, availability, featured placement and checkout links. In-site merch and Flare/camo DJ Bumpboxx pages read saved product records. Product stock is display metadata, not transactional inventory. Commerce payments, reservations, order management, tax/shipping and fulfillment remain production gates. No sample prices or giveaway availability are invented.

Private drafts/uploads/history are excluded from public JSON, Git and deployment. Source/delivery share canonical local state. Production remains fail-closed: port records/media to D1/R2, integrate authenticated staff roles, moderation/review, image/audio processing, real audit actors, scheduled publishing, backups and payment/order webhooks. Do not expose the local Python editor on the public internet. See docs/CMS-GUIDE.md.
