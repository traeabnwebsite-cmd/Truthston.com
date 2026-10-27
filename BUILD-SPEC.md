# Trae Tha Truth — sliced production build specification

Version 3.0 · October 27, 2026 · Audited prototype baseline `b499d9a`.

Read [COMPLETION-REPORT.md](COMPLETION-REPORT.md) for current completion evidence and [MONOLITH-BREAKDOWN.md](MONOLITH-BREAKDOWN.md) for the refactor sequence. This specification supersedes the v2.1 delivery order and single-file source requirement. The detailed [v2.1 product requirements](docs/BUILD-SPEC-v2.1.md), [stamp/member contract](docs/MEMBERSHIP-AND-STAMPS.md), [media intake contract](docs/MEDIA-INGEST.md) and [CMS guide](docs/CMS-GUIDE.md) remain supporting requirements where they do not conflict with this version. The historical v2.1 status table is not the current completion report.

## Product contract

Site brand: **Truthston.com**. Artist: **Trae Tha Truth**. Shop: **ABN Records, CDs and Tapes**. Tagline: **Tha Truth & Nothing but Tha Truth**. Membership invitation: **Join the site. Get stamped. Get approved.** Preserve the approved cream/black/red/amber/green design, enlarged rubber stamp, illustrated companion, theater sightline and stylized Houston world. The rejected primitive 3D companion stays excluded. Geography is compressed; GTA-level photorealism and surveyed full-scale city accuracy are not achieved deliverables.

Owner-provided Trae intellectual property, partner arrangements and acquired photos are already cleared in the project context. Do not reopen blanket permission questions. Individual catalog records still need correct allowed-use/publication settings and accurate attribution. Production media comes from authorized source files or contracted origins; consumer streaming subscriptions are not the planned media backend.

A completed slice includes visible UI, correct loading/empty/error states, accessible controls, appropriate tests, source/delivery synchronization and a documented operational boundary. A page mockup, schema migration or external checkout link alone does not complete its corresponding production service.

Latest owner addition: brand the site Truthston.com; add “Welcome to Truthston, Texas” in the city; apply intricate worn-ink designs throughout the Stamp Book (varied designs, with matching shape and color within a related family), including individual stamps for Trae tha Truth, 6 Tre G, Dougie D and Roc. Truthston branding, welcome sign and 35 collection designs (12 sourced venue collectibles) are implemented at preview scope. Individual and campaign stamps remain unissued. These additions belong to S01/S03/S11. They do not change official award authorization or activate real credits.

## Architecture decision

Keep **Cloudflare Workers + Static Assets** for hosting/API, **D1** for relational application records, **private R2** for authorized audio/artwork masters/downloads, and a private video adapter with **Stream as the existing baseline proposal**. Keep **Better Auth as the proposed identity implementation**, subject to a pinned-release compatibility proof on Workers/D1, and **Stripe hosted Checkout/customer portal** for subscriptions/purchases. The artist's existing merch provider is the preferred fulfillment integration; external official Bumpboxx purchasing can continue.

These are selected/proposed service roles, not claims that their bindings or paid services are already provisioned. Supabase is not a dependency of this target. A failed identity compatibility proof should trigger a documented adapter decision, not custom session cryptography. Email delivery must have a verified transactional provider before sign-in/recovery launches. Cloudflare email capability remains conditional until enabled and tested for this account.

Split source by feature while retaining one repository and initially one Worker entrypoint. Use ordinary browser ES modules and external CSS so the local preview still needs no frontend compilation. A later build-tool adoption is a separate decision. Production database migrations, package checks and Worker deployment still use tooling. Do not retain a single deployable HTML file at the expense of module boundaries.

Cloudflare documents the relevant [static assets deployment](https://developers.cloudflare.com/workers/static-assets/), [D1 Worker binding](https://developers.cloudflare.com/d1/worker-api/) and [R2 Worker binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/). Costs/quotas must be reviewed when resources are actually provisioned; this document introduces no new price commitment.

## Slice acceptance register

The IDs below remain stable across the report, implementation tasks and future completion reviews. Status is at this audit, not a promise that remaining work is complete.

### S01 — Brand, homepage and responsive shell · LIVE / PARTIAL

**Existing:** brand/header, modes, navigation, approval stamp, homepage, fixed player, recent phone spacing and desktop reading sizes.

**Finish:** consolidate responsive rules into feature-owned styles; readable copy and controls without overlaps at supported sizes; ensure stamp, companion and account controls have reserved layout space. Preserve normal browser zoom/text scaling.

**Acceptance:** inspect 320/390/430/768/1280/1440 widths plus short landscape and 200% zoom. No page-level horizontal overflow, hidden primary actions or text over unrelated geometry. Content may scroll within explicitly labeled carousels. Test real iOS Safari and Android Chrome. Depends on refactor shell/styles.

### S02 — Record store and navigation · LIVE / PARTIAL

**Existing:** distinct sleeves, release overlays, room stations, keyboard HTML twins, fullscreen/fallback and reduced-motion modes.

**Finish:** lazy room loading, deterministic scene lifecycle and complete object-to-HTML action coverage. Keep DJ directions in their dedicated panel, including explicit fullscreen placement. Remove 3D lifecycle ownership of ordinary page/player behavior.

**Acceptance:** keyboard-only access to every meaningful room action; WebGL/CDN failure leaves catalog/player usable; repeated enter/leave/fullscreen cycles do not duplicate listeners, leave overlays behind or leak renderers. No rendering while tab hidden; offscreen/non-room routes suspend scene work.

### S03 — Houston, landmark models and geographic continuity · LIVE / PARTIAL

**Existing:** named landmarks/streets/freeways, bridge approaches/years, roofs, vehicles, venue marks and Transco surroundings.

**Finish:** location-by-location likeness/continuity review, building/road registration, stable far clipping and performance tuning. Use approved references/colors. Keep separate model builders and data-driven placement; avoid one giant scene constructor.

**Acceptance:** orbit each landmark through 360 degrees without clipping/disappearing faces or mirrored signage; roofs open/close without intersecting supports; no registered building in a roadway; bridge connects at both ends and years do not obscure its wording; retained routes are traversable. Review visual quality separately from commercial functionality.

### S04 — Catalog, release views and library content · LIVE / PARTIAL

**Existing:** 138 artwork/release references; partial real tracklists, release view, sharing and local favorites. All 138 CMS project references remain drafts.

**Finish:** stable project/track/asset IDs; reconcile duplicate versions, release dates, credits and ordered tracks; normalize CMS/catalog/companion references. Clearly separate browsable metadata, public previews, member-included and purchased files. No sleeve should imply an unrelated preview is its actual music.

**Acceptance:** import a representative real project and resolve every displayed track to the correct authorized asset. Search/share/direct links survive title edits. Owned/included/saved library states are distinct and reflect the server. Depends on cloud content/media and identity for private library.

### S05 — Audio, DJ and media delivery · LOCAL demo + LIVE fallback / PARTIAL

**Existing:** local Boss Ballin; public generated beat fallback; analyzer/player; two-deck linked pitch, offset/crossfader/scratch.

**Finish:** private ingest/published asset separation, streaming range support, signed/bounded authorization, catalog queues, metadata/media-session handling, authorized DJ selection and memory profiling. Ordinary audio and DJ clock operate independently of WebGL rendering. One stored track can serve many authorized members; a separate upload per listener is unnecessary.

**Acceptance:** authorized playback, seek, 200/206/416 ranges, token expiry, revocation, denied membership and concurrent member/device cases; private files never fall through to static hosting. DJ decks share one eligible song, adjustable beat grid, responsive manual cuts and scratch recovery. Validate decoding/memory on target devices. No real music master is copied into public static assets to bypass authorization. Depends on S04, identity/entitlements and private storage; test public fixture can precede billing.

### S06 — Theater and video · LIVE public YouTube / PARTIAL

**Existing:** room-screen player, film strip, lighting, projector camera, seated illustrated companion and fullscreen.

**Finish:** provider adapter, private premium video authorization if offered, captions/failure states, phone geometry and player-control/privacy review. Public YouTube remains free; premium catalog uses separately authorized files/provider assets.

**Acceptance:** play/switch/end/error/denied/embed-blocked flows; clean player destruction, music pause/resume policy, accessible selection, lights-up/exit and clear companion head sightline across supported aspect ratios. Private tokens cannot be used after access ends. Depends on S02/S07 interface and S10/S15 for premium access.

### S07 — Companion · LIVE illustration/local guide / PARTIAL

**Existing:** approved character, intact poses, occasional sparkle, drag, cloud, compact actions, portal/world travel, local guide and persistent dismissal.

**Finish:** live AI provider/knowledge adapter, content refresh, moderation/input limits, voice-device states and fallback. Explicitly separate illustrated animation from room placement and chat UI. Hidden means no world entry or promotional interruption until restored.

**Acceptance:** dismiss/reload/restore without entering the shop; drag/chat/voice/store and route changes do not obstruct content; failure/offline mode remains useful; answers use actual catalog/site availability and cannot grant awards, charge money or impersonate a personal artist response. No cloned voice assumed. Live AI usage/spend reviewed before enabling.

### S08 — Newsroom, photos and events · LIVE snapshot / PARTIAL

**Existing:** 106 published briefs, 113 photos, two dated past events, article/gallery/event routes and source links. Forty-four additional articles are drafts.

**Finish:** editorial verification/date precision/captions, real upcoming event intake, responsive article QA and cloud content freshness. Past events remain archived, not represented as upcoming. No automatic unreviewed scraping/publication.

**Acceptance:** staff edits publish to the public site without a code commit after S09 is complete; drafts never appear in public API; scheduling/timezone/archive behavior tested; source URLs and credits survive edits; deleted/unpublished public assets have a documented cache/revocation limitation.

### S09 — Staff CMS and content persistence · LOCAL; cloud NOT LIVE

**Existing:** local disk-backed articles/photos/events/projects/products/site-copy editors, draft/publish/schedule, chunk uploads, versions/history and source/delivery mirroring.

**Finish:** authenticated staff roles and privileged audit identity; D1 repositories, private R2 uploads/processing and a cloud publisher; multi-editor conflicts, scheduled publication and recovery. Bulk project intake needs manifests, checksums, resumable upload, processing and per-file error reports beyond the current multi-file local MP3 intake.

**Acceptance:** editor can upload an image and real multitrack project, save private draft, publish/unpublish, schedule and edit a merch item on staging with no source edit. Unauthorized member cannot read draft media or change content. Conflicting saves produce a recoverable conflict. Backup/restore recovers content and asset references. Local adapter stays available during migration. Depends on staff identity, D1/R2 and S04 contracts.

### S10 — Member identity and account pages · design PARTIAL; real accounts NOT LIVE

**Existing:** account/dashboard/Stamp Book/membership/library/rewards/community/settings designs and editable device-local demo state.

**Finish:** provider-managed verification/sign-in/logout/recovery, secure sessions, roles, cross-device profile/library and consent. Generate identity tables from the chosen pinned package, separately from existing application migrations. Never import browser balances or official approvals as trusted member data.

**Acceptance:** verify/retry/expired-link/logout/revoke/recovery flows; two real members cannot access each other's data; profile survives another device; staff role cannot be self-assigned; unauthorized routes fail. Paid state comes from S15, not the browser. Depends on staging/email/database readiness.

### S11 — Verified stamps · FOUNDATION; real earning NOT LIVE

**Existing:** local activity awards, versioned configuration, tested internal policy evaluator and SQL constraints. Requirements: five qualifying release views, four landmark views, 60 qualifying audio seconds, four manual DJ cuts. ABN Approved/Guerilla Maab remain staff-scoped official grants.

**Finish:** authenticated event/receipt endpoints, bounded validation, idempotent award service and official issuer console. Qualifying activity must use server-validated evidence; a client-submitted count or receipt-shaped JSON is not authoritative.

**Acceptance:** forged totals rejected; repeated/replayed events do not re-award; automatic DJ cuts excluded; role revocation prevents grants; audit issuer retained; daily/campaign timezone edges tested. Project download stamps require eligible entitlement and observed delivery start. Permanent stamps are not consumed on redemption. Depends on S10/S04/S05/S09 and deployed D1 verification.

### S12 — Credit rewards and giveaways · FOUNDATION; real redemption NOT LIVE

**Existing:** local demo ledger/rewards and schema safeguards. Current founding activity values are proposed configuration, not approved dollar conversion.

**Finish:** approved earning/redemption economics, offer stock/size eligibility, atomic debit/reservation/redemption, one-time compensation, provider-bound discounts and fulfillment. Giveaway campaigns need organizer-approved rules/eligibility/selection/audit before activation.

**Acceptance:** simultaneous last-stock/redemption cannot overspend or double-allocate; retry cannot duplicate debit/refund; fulfillment failure stays recoverable; permanent stamp retained; eligible discount applies exactly once to the correct member/order. Giveaways are separate from deterministic merchandise redemption. Depends on S11/S13/S15 and approved program decisions.

### S13 — Physical merch and Bumpboxx · browsing LIVE; editing LOCAL / PARTIAL

**Existing:** seven published product records, display/rack entrypoints, wishlist, editor fields and official external purchasing links.

**Finish:** approved SKUs/media/prices/sizes, existing merchant/provider selection, checkout/order/inventory webhooks, tax/shipping/returns/support and member reward bridge. Choose responsibility for each order: external referral or integrated site checkout; do not imply site fulfillment for external purchases.

**Acceptance:** correct variant checkout, stock change, cancellation/refund, order status and reward discount reconciliation in test mode. CMS product edits reach both store and DJ product view. No availability or price invented for concept products. Depends on S09 and commerce provider setup; rewards depend on S12.

### S14 — Hosting, repository and environments · preview LIVE / PARTIAL

**Existing:** GitHub/Cloudflare automatic main deployment, custom domain/TLS, local launch and asset packager. Existing unrelated account connections retained.

**Finish:** protected staging with isolated databases/buckets/secrets/payment modes, module-aware package validation, release provenance, cache compatibility and rollback procedure. Keep a single automatic production deployment path.

**Acceptance:** deploy a reviewed change through staging, promote, then restore previous version without mixing incompatible cached JS/HTML or running destructive schema rollback. Private media/drafts stay outside deploy assets. Migration changes are backward compatible through a rollout. Depends on R0 tooling before module extraction.

### S15 — Billing, authorization and operations · FOUNDATION; billing NOT LIVE

**Existing:** Worker stub/health/static/content/optional companion endpoints, fail-closed premium paths, SQL safeguards and checks.

**Finish:** Stripe products/hosted Checkout/portal, signature-verified durable webhooks, entitlement reconciliation, rate limits, security headers/CSP, logs/alerts, backups, support and incident procedures. Ordinary request handlers do not transcode entire masters or buffer unbounded uploads.

**Acceptance:** payment success/failure/duplicate/out-of-order/cancellation/refund tests; success redirect alone never grants access; server-owned prices; no cross-member leakage; media/catalog revocation; restore drill and account export/deletion workflow. Load/cost review before enabling live sales. Depends on S10/S04/S14; S05/S06/S12 consume its entitlements.

### S16 — Community, accessibility and release quality · PARTIAL

**Existing:** simulated visitor count/Truth Meter, challenge and date panels, proposed community area, reduced motion/Calm, focus and object twins, adaptive scene resolution.

**Finish:** decide whether local simulations remain clearly labeled or become real services. Community features require separate moderation/report/block/retention/consent work. Finish full manual accessibility/device, flash, memory, playback, performance and production security audits.

**Acceptance:** assistive technology can complete catalog/account/media/reward tasks without 3D; no inaccessible fullscreen exit or keyboard traps; no unexpected audio; actual device tests and background/restore behavior pass. If launched, opt-in public books/shared sessions/polls have privacy/moderation and authorization gates. Shared presence must not be inferred from a local random counter.

## Ordered delivery releases

Complete and verify each job before the next. Existing historical jobs retain their order in WORK-QUEUE.md; this is the future dependency order.

| Release | Work | Exit gate |
|---|---|---|
| P0 | Refactor slices R0–R8 in MONOLITH-BREAKDOWN.md; preserve current behavior | Modular source, direct module tests, no UI/functionality regression and safe deployment |
| P1 | Staging isolation, pinned identity proof, member/staff roles, transactional email and D1/R2 repositories | Real own-account and staff authorization flows pass; resources and secrets isolated |
| P2 | Cloud CMS, catalog normalization and one representative batch intake | Authenticated staff publish article/photo/event/merch/project without code commits; private drafts protected |
| P3 | Protected streaming/downloads and eligible DJ catalog | Asset identity/access/range/expiry/revocation/device limits tested against uploaded authorized files |
| P4 | Verified stamp receipt/award service and issuer tools | Retry/forgery/race/scoped-approval tests pass against staging D1; no trusted browser credit migration |
| P5 | Stripe test purchases/subscriptions and entitlements | Verified webhook reconciliation and all cancellation/refund/denial paths pass |
| P6 | Commerce/reward fulfillment, premium video if included, finalized product/content terms | Real provider test orders/redemptions and private video authorization work; no demo CTA implies real service |
| P7 | Launch quality and operational rehearsal | Mobile/accessibility/security/load/editorial/backup/support acceptance and owner release approval |
| P8 | Invited cohort, monitored launch and expansion | Actual usage/costs/errors/fulfillment reviewed before scale-up |

Community expansion and a future faithful 3D companion are separately scoped after the core launch unless the owner reprioritizes them. No calendar completion date or budget is implied by this sequence.

## Decisions still needed from the team

These are dependencies for their future slice, not blockers to refactoring: paid plan pricing/benefits; launch catalog with streaming/download/DJ settings; merch provider/fulfillment responsibility; actual reward offers/credit economics; giveaway campaign rules; premium-video requirement; supported devices and launch regions; staff/affiliate role holders; support/privacy/retention policies. Existing blanket IP clearance is recorded and is not requested again.

## Completion reporting rule

Every implementation handoff must list slice IDs changed, exact completed acceptance checks, remaining gaps, deployed commit, changed data/service bindings and any rollback limits. Keep LOCAL, FOUNDATION and LIVE distinctions. Do not publish a percentage without defined, weighted scope and explicit evidence. A successful unit suite or a deployed preview alone does not complete the commercial platform.

### Latest visual/content corrections

Angel By Nature winged seal; fitted heavy Guerilla Maab family with vinyl symbols; ABN lines/thumbs-up; supplied Hustle Gang logo and historical Rap-A-Lot logo. Trae Day designs use physical venues and linked evidence, not city labels: see [research](docs/TRAE-DAY-VENUES.md). Toyota Center roof repaired; downtown 13 named complexes geographically spread: see [inventory](docs/SKYLINE-INVENTORY.md). These complete the current preview requests, while commercial acceptance gates above remain pending.
