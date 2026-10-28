# Truthston.com — completion build specification

Version 5.0 · October 28, 2026 · Execution order and acceptance contract

This is the current completion plan. It supersedes status claims in older build specs and queue entries. `BUILD-SPEC.md` retains the stable S01–S16 product contracts; this register defines the remaining implementation order. “Implemented” means code exists; “verified” requires evidence; “live” requires a successful production deployment. A passing unit suite is not a mobile visual review.

## Product and architecture

Truthston.com is Trae Tha Truth’s immersive music, culture and membership platform. The shop is ABN Records, CDs and Tapes. Preserve the approved illustration, OG/hero skyline, worn-ink stamp families and cream/ink/red/amber/green palette. Do not substitute the rejected primitive 3D companion. Authorized source material and partner permission are established by the owner.

The frontend monolith has been separated: native ES modules, feature factories with explicit lifetimes, lazy Three.js world, independent Web Audio, separate room/landmark builders, feature styles and content-addressed release assets. Keep these boundaries. One repository and one Worker do not themselves make a monolithic frontend. CSS still has legacy cascade debt; consolidate within each feature only after visual coverage exists. Source preview requires no frontend build.

Target services: Cloudflare Workers + Static Assets; isolated D1 application databases; private R2 source/premium media; a private video provider adapter (Cloudflare Stream baseline); provider-managed identity (Better Auth pending a Workers/D1 compatibility proof); Stripe hosted billing; verified transactional email; artist’s chosen merch fulfillment provider. Supabase is not required. Never use a shared Apple Music/Spotify consumer subscription as the paid music origin. Upload authorized files once; authorized members can stream concurrent copies from private storage. Existing free YouTube embeds remain public content.

## Evidence-based starting point

- Live baseline: `a834ca2`, release `d038ad231ab52743a89a`, GitHub `traeabnwebsite-cmd/Truthston.com`; Cloudflare Worker `trae-tha-truth-preview`, account `90e7a4da02e47f49eb819dd595f1f430`; apex and www are configured.
- Implemented: modular catalog/release sharing; public Boss Ballin preview and dual-deck DJ; city/landmarks/roofs; companion/local guide; theater YouTube integration; newsroom; unique photograph gallery; real calendar; merch browsing; local disk CMS including product/project editors; prototype account and Stamp Book pages.
- Tested foundation: membership policy, immutable credits/official-issuer schema, local CMS/version/upload behavior. No real member sessions, payments, cloud CMS, premium delivery or reward fulfillment is live.
- Uncommitted first slice: dedicated phone Standard layout, persistent fullscreen session, theater control cleanup, equal-size doors, freeway/year clearance, startup readiness guard. Last automated run: 65 Node + 19 Python tests pass. Browser acceptance remains open.
- Content figures in older documents conflict. Generate an inventory from current published assets instead of repeating historic counts or treating draft project references as playable projects.

## Completion slices — execute in this order

### C01 / S01 S02 S06 — finish the current responsive and fullscreen job

**Status:** deployed at3d5a617 / code416f9c35b249ec1f3a8c; desktop/touch-emulation verification complete. Physical-device launch verification remains open in C13. See `MOBILE-AND-THEATER-AUDIT.md`.

Deliver a dedicated phone Standard layout, readable type, reserved regions for guide/stamp/player and consistent page navigation. Preserve one fullscreen root through all seven destinations and embedded content. Retain fullscreen intent across orientation/browser transitions; provide a menu recovery action and explicit exit. Home-screen app mode supplements browser support. Normalize every shop/elevator/upstairs entrance to the same opening. Move year signs/cables entirely outside freeway footprints.

Theater: remove Browse films; one vertical side rail; selecting a film hides every control/rail/toolbar. Tap/click viewing area or keyboard restores controls. Playback, lighting, return, YouTube and fullscreen belong in the menu. No floating companion panels in shop. No controls across the seated guide or projected picture.

**Gate:** screenshots and bounds audit at320/390/430 portrait,844×390 touch landscape,768/1280/1440; inspect home, archive, releases, checkout, merch/Bumpboxx, radio, studio, newsroom/article, gallery/lightbox, calendar, every account tab, release/DJ/share/timeline/chat dialogs. Immersive: shop, DJ, theater, merch, Streets, radio and studio in both orientations, plus native/API-absent fullscreen and explicit exit. Check video selection/wake/hide and keyboard. Real iPhone Safari/Android checks are separate from desktop emulation and must be identified accurately. All automated checks; release packaging; commit/push; wait for Cloudflare; check live version.

### C02 / S14 S16 — operational release and capability truth

**Status:** operational tooling implemented: generated inventory/preflight, CI gate, public health capability/release reporting and read-only live smoke. Cloud backup/rollback rehearsal still depends on C04/C13. See `OPERATIONS-AND-READINESS.md`.

Create a reproducible content/capability inventory and preflight report. Detect absent real bindings/providers instead of advertising paid functionality. Publish exact release identity and validate staging/production separation. Update stale architecture/deployment/handoff documents. Establish rollback to the previous known release, smoke checks and a launch checklist with owners/evidence. CI must fail on broken imports, tests, public private-media leakage or release packaging.

**Gate:** report generated from repository configuration and published records, no credentials in output; production health distinguishes unconfigured services from ready ones; rollback assets resolve; staging cannot target main’s domain; service failure remains usable/closed as appropriate.

### C03 / S04 — canonical catalog and intake

Normalize stable project/track/asset IDs while preserving legacy links and ordered track lists. Distinguish metadata-only, preview, member stream, purchase/download and DJ-eligible content. Import manifests with duplicate checksums and field/file validation; no invented tracks/dates/prices. Show useful empty/error states. Never label the single Boss Ballin demo as another project’s audio.

**Gate:** representative album + mixtape + single ingested; correct artwork/tracks; title edits preserve URLs; duplicate retries are idempotent; unpublished assets inaccessible; inventory reports missing masters and metadata explicitly.

### C04 / S14 S10 — isolated cloud foundations and identity proof

Provision isolated staging D1/R2 only in the Trae account with suitable credentials; apply additive migrations; establish backup/restore and private buckets. Prove pinned identity package compatibility, migrations, verification/session lifecycle and email delivery on Workers. Configure secrets through provider facilities, not Git. Verify Access/staff protection independently from member roles. Keep current unrelated account credentials intact.

**Gate:** two verified test identities and a separate staff identity; logout/recovery/revocation/expiry; no cross-member data access or self-assigned roles; verified email; isolated staging data; recover a backup. Missing account credentials are a real integration dependency, not permission to use another account.

### C05 / S09 — production CMS

Port existing content repository adapters to D1/private R2. Add authenticated staff roles, audit actor, optimistic version conflicts, chunked/resumable image/audio intake, processing/checksums, draft/schedule/publish/unpublish and recovery. Editors include site copy, news, calendar, gallery, catalog, merch SKUs/media/variants and radio queues. Preserve local adapter.

**Gate:** staff uploads a full project and product image, edits price/size, publishes without source commit; unauthorized member cannot read drafts or mutate; concurrent editor conflict recoverable; scheduled timezone behavior; rollback and asset-reference restore.

### C06 / S05 — authorized music delivery

Private streaming/download endpoints with entitlement checks, correct200/206/416 byte ranges, bounded URLs, expiry/revocation, content types and Media Session support. Queue only available tracks. DJ operates on one authorized cached buffer with two clocks, beat offset, linked pitch/crossfader/scratch; no dependency on render loop.

**Gate:** deny unauthorized/expired users; seek/ranges; concurrent listeners; no master in static assets/logs; phone memory and interrupted playback; DJ manual cuts and scratch recovery on real touch devices.

### C07 / S15 — billing and entitlements

Stripe test-mode checkout/portal; approved plans/price IDs; server member/customer linkage; verified webhook signatures, durable idempotent event handling, cancellation/payment failure/refund and reconciliation. Purchased files remain distinct from subscription inclusion. Success URLs never grant access.

**Gate:** end-to-end test payment, duplicate/out-of-order webhook, failed payment/cancel/refund, cross-member denial and reconciliation. Owner supplies actual prices, countries/tax treatment and access policy; do not invent commercial terms or activate live charges prematurely.

### C08 / S10 — real member pages

Connect overview, library, membership, Stamp Book, rewards and settings to authenticated repositories. Add sign-in/recovery/verification states, cross-device saved library, owned/included distinctions, privacy/consent, devices/revocation and account deletion workflow. Clearly remove local-demo claims only when replaced by real services.

**Gate:** cross-device state; empty/loading/error; paid changes from server; keyboard and phone visual review of every page; no import of local balances as trusted awards.

### C09 / S11 — verified stamp earning

Authenticated bounded activity sessions/receipts, nonce/sequence/server elapsed checks, policy version and atomic idempotent award. Implement crate/landmark/music/manual DJ qualifications; project stamps tied to eligible delivery. Scoped staff ABN/Guerilla Maab grants with immutable issuer history. Permanent stamps survive credit redemption. Preserve detailed worn-ink art/family consistency and fitted labels.

**Gate:** forged totals, replay, concurrency, auto-chop exclusion, subscription expiry, role revocation and Houston campaign boundaries. Award once, credit once, accurate member book/progress. Client assertions alone never prove attention.

### C10 / S12 S13 — merch rewards and giveaways

Integrate approved merchant/SKUs/variants, stock/order status/refund webhooks and fulfillment ownership. Atomic credit debit/stock reservation/outbox; retry and compensation. External Bumpboxx referrals clearly remain external until provider integration exists. Giveaways require actual campaign rules/eligibility/selection audit; no invented funded offers or dollar conversion.

**Gate:** two users competing for last item; replay/refund; no overdraft/double award/fulfillment; correct variant; permanent stamp retained; discount belongs to correct member/order.

### C11 / S06 S07 — premium theater and live guide

Provider adapters, embed-blocked/error/caption states, premium video authorization if offered; music/video interruption policy. Connect grounded guide to published catalog/CMS knowledge; rate limits, input bounds, cancellation, optional browser voice with device states. Keep useful local fallback; never imply artist personal responses, award authority or unconfigured live recording.

**Gate:** video switch/end/denied/failure cleanup; controls and sightline on phones; model failure/rate limit/voice denial; dismiss means no surprise room entry/promotions; no credentials client-side.

### C12 / S03 S08 — world and editorial finishing

Inspect every landmark360°, correct signage/colors/entrances/roofs/street continuity and bridge approaches; controlled density/performance rather than claiming GTA photorealism. Source-verifiable news/captions/dates; full images/readable articles; photographs-only unique gallery; upcoming/past calendar distinction. Publish real events when supplied.

**Gate:** no building/road conflict or disappearing faces; roof toggles independent; all interactive twins; adaptive rendering/hidden-tab suspension; no repeated photos/false future events; staff editorial changes live without code deploy after C05.

### C13 / S16 — production release rehearsal and launch

Run complete browser→API→DB→media→billing→reward flows with separate test members and staff, load/concurrency and accessibility review. Real iOS/Android and desktop support matrix, degraded network/CDN/WebGL tests. Configure operational alerts, backup cadence, support/refund routes, privacy/terms/accessibility and measured budgets. Document restore/credential rotation/incident ownership. Promote one reviewed release and smoke all main routes.

**Gate:** every earlier acceptance item has recorded pass evidence or explicit owner-approved launch exclusion; no unconfigured feature sold as live; rollback rehearsed; production secrets/bindings/providers verified. Final report lists release, deployed services, content inventory, limitations and operational owner.

## Autonomous execution rules

Complete and verify a slice before moving on. Commit completed updates and push through the established main/Cloudflare pipeline; never claim deployment while queued/failed. Reuse existing authorization and proceed on reversible implementation. Continue local/test implementation when provider credentials are unavailable, but keep dependent production gates open. Missing prices, private masters, transactional email or account access cannot be fabricated. Record concrete blockers and continue independent work. Do not silently enable fees, collect payments, fabricate users or import prototype credits. Maintain this register and `CLAUDE-HANDOFF.md` so another agent can continue from exact evidence.
