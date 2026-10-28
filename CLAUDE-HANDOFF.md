# Completion execution checkpoint — October28,2026

C01 deployed3d5a617 (mobile/fullscreen/theater); C02 deployedd779d14 (readiness/health/provenance). Read-only live HTTP smoke passed on apex/www. C03 stable IDs/share links and batch intake dry run implemented; tests and browser shared-link roundtrip pass. Full production C03 remains gated on actual ingest through C04–C06. Never call draft sleeves playable projects.

Next independent integration work is C04: isolated staging D1/private R2 and identity compatibility proof. Cloudflare browser access has been resumed through the existing Trae GitHub profile; no unrelated account changes. No production D1/R2/email/billing configured. Better Auth official docs now use @better-auth/drizzle-adapter, not older adapter import assumptions; re-read current docs before pinning a package. No new auth dependencies installed yet. Keep public health unconfigured until actual services pass. See docs/COMPLETION-BUILD-SPEC.md and docs/OPERATIONS-AND-READINESS.md.

User standing authorization: implement spec autonomously in order, commit/push completed updates, keep mobile parity and accurate deployment reporting. Physical-device verification remains open. Do not restart older monolith tasks or restore rejected 3D guide.

---

# Active completion work — October 28, 2026

Read docs/COMPLETION-BUILD-SPEC.md first. Owner requests autonomous implementation in order, complete each job before the next, commit/push completed updates. C01 mobile/fullscreen/theater corrections are implemented and browser-audited; see docs/MOBILE-AND-THEATER-AUDIT.md for evidence and physical-device limitations. C02 operational readiness tooling follows. Main already contains the modular frontend; historical branch-only notes below are obsolete. No real commercial services are configured. Do not use WebFaktory Cloudflare credentials for Trae resources.

---

# Current release — record store floor plan and upstairs expansion

October 28, 2026. Owner explicitly approved publishing the shared expansion and coordinating with “Develop and critique platform vision”. See docs/STORE-EXPANSION.md and review/STUDIO-REBUILD-HANDOFF.md. Checkout/Reign are at the back; Giving display is removed pending a separate Relief Gang room. Elevator shares the DJ wall; screening is opposite DJ; merch has a separate right-wall door; side shelves end before doorways. Same floor order on desktop/mobile: Record Store, DJ Booth, Screening Room, Merch Store, Streets, then WABN Radio and Studio ABN. No separate Streaming/Purchases/Checkout bottom items.

Store and radio pages remain free-preview/device-local; payments, real entitlements and studio recording are not activated. Reign is a sourced local guide. Keep the established fail-closed service boundaries. Final combined verification:61 Node+19 Python tests and desktop/phone WebGL/navigation checks. Previous live modular commit b3ba1dc is the packaged rollback reference.

---

# Live deployment update — October 28, 2026

The modular version was merged into main at97a4bf2. A shallow-clone rollback dependency caused the first Cloudflare build to fail;38d2d00 fetches the exact pinned rollback SHA when absent and deployed successfully. Both truthston.com hostnames serve the modular release.74 tests pass (55 Node+19 Python).

Owner requested Boss Ballin on the live DJ decks. Public playback now uses assets/audio/boss-ballin-preview.m4a, a full-length318.093s AAC128k web rendition made from the owner-supplied MP3. This specific preview is intentionally public for playback and both decks share the same decoded buffer. The source MP3 remains private/ignored; other catalog masters remain excluded. Do not mistake this public demonstration track for configured premium-media delivery.

Historical branch-only/no-merge statements below predate promotion.

# Current handoff — modular frontend complete

October 27, 2026. Worktree: `/Users/brandonhughes/.codex/worktrees/truthston-modular/Trae Tha Truth`; branch `codex/modularize-frontend`. R0–R8 are complete. Read docs/refactor/ARCHITECTURE.md, docs/refactor/STATUS.md, COMPLETION-REPORT.md and BUILD-SPEC.md v4 before continuing. Historical notes below are superseded where they call the frontend monolithic or ask to resume R4.

`assets/app/main.js` is a three-line entry; application.js composes services. Audio/DJ, theater, companion, pages, shell and room/city/landmark builders have explicit owners/lifetimes. Keep the approved illustrated companion, fitted wood door and persistent restore control. Main/delivery/live retain the protected stable version. No merge/deploy was performed; preview workflow targets isolated staging, not the live Worker.

Current source preview: http://localhost:8765/?v=modular-complete (alternate 8767; stable 8766). Source runs through `python3 -m server.preview --port 8765`, without frontend compilation. Public packaging snapshots native JS/CSS with rollback code and excludes private masters. Update TRUTHSTON_ROLLBACK_REF to the actual live commit at a future approved promotion; current default 3e81bd3 is the protected baseline. Never use the unrelated Cloudflare token from the shell environment for a real deployment.

Verification:51 Node + 19 Python tests and types/schema/source/module graph checks pass; module graph has 79 application/CMS modules without cycles. Identical 4,874-object scene fingerprint,242 parcels / 166 street segments/zero conflicts; real software-WebGL smoke passed without a production FPS claim. Browser routes,138 releases/66 unique photos/35 stamps/calendar, DJ 75% pitch/cut, fullscreen and companion recovery passed. Full teardown/remount preserves counts without duplicates. See handoff/refactor/*.json and docs/refactor/ARCHITECTURE.md.

Owner confirmed photographs only: no video-still gallery. Production identity, payments, private R2 delivery, authoritative reward issuance/redemption and cloud CMS are still unconfigured; preserve the fail-closed service boundaries. Do not confuse modularization completion with subscription-business launch. Finish each subsequent job and verification before starting another.

---

## Latest completed job — newsroom audit

26 original sourced desk reports now replace thin published research notes;80 references retained as CMS drafts,44 existing private articles preserved. Full-frame photos keep heads visible; lead image/copy form a desktop spread, dispatches below, phone stacks. See docs/NEWSROOM-AUDIT.md and handoff/refactor/newsroom-audit.json. Current verification:54 Node+19 Python tests;80 application/CMS modules. Preview http://localhost:8765/?v=newsroom-complete#newsroom . Edition application is idempotent; do not overwrite subsequent CMS edits. Main/live remain protected.

## Historical handoff log

## Latest completed update — October 27, 2026

Read COMPLETION-REPORT.md, BUILD-SPEC.md v3, MONOLITH-BREAKDOWN.md, WORK-QUEUE.md and docs/TRAE-DAY-VENUES.md first. Jobs25–30 are complete at their stated prototype/research scope. Truthston.com branding/welcome sign;35 worn-ink stamp designs, four matching GUERILLA MAAB member marks, Angel By Nature wings, ABN lines/thumb, exact supplied Hustle Gang emblem, Rap-A-Lot logo;12 sourced Trae Day venues replace city labels. No display-only design grants real awards/credits. Toyota Center solid curved roof and court restoration fixed;13 geographically placed downtown complexes with road/freeway clearance checks. Stamp artwork and skyline layout are native modules, but most frontend remains a monolith; R0–R8 is a plan still to execute. 21 Node+17 Python tests, types/assets/SQL pass. Do not treat old handoff counts/status below as current. Real identity/D1/R2/Stripe/cloud CMS/AI remain unconfigured and protected routes fail closed. Preserve the approved illustrated companion. Finish one job and its verification before the next.

# Historical step — initial Truthston branding and stamp collection — October 27, 2026

Site now Truthston.com; artist remains Trae tha Truth; store remains ABN Records, CDs and Tapes. Street has elevated Welcome to Truthston Texas gantry.25 stamps grouped by family, same shape+ink for related designs. Four member stamps name Guerilla Maab; project/DJ/Trae Day/location/Relief/affiliation/Vault designs added. All share worn ink and detailed ornaments, safe text widths. ABN uses top lines and bottom thumbs-up, no five-point stars. Logo assets/provenance in assets/branding; Hustle mark is official clothing-store bear variant. New concepts are display-only/unissued, zero-credit; existing award policy unchanged. assets/stamps.mjs and stamps.css isolate presentation; collectible-stamps.json defines display-only extras. This small feature extraction is not the full planned refactor. Roof repair next, then skyline reference audit.

---

# Historical step — initial completion audit and build plan — October 27, 2026

Read COMPLETION-REPORT.md, BUILD-SPEC.md v3 and MONOLITH-BREAKDOWN.md. Frontend is monolithic; CMS/backend partly separate. Owner requested report and a plan, not an immediate full refactor. R0–R8 is the proposed gated extraction; no extraction has happened. Existing commercial services remain unconnected. New owner request queued next: Truthston.com branding, Welcome to Truthston Texas city sign, all Stamp Book designs matching approved banner stamp, four individual affiliate stamps. Preserve official award authorization; no real approval/grants from browser UI.

---

# Latest ABN stamp refinement — October 27, 2026

Homepage ABN Approved seal is now inline SVG,200px desktop/174px tablet, with a bold rectangular ABN APPROVED banner across the circular seal, curved lettering, stars and scattered ink flecks matching the owner’s supplied rubber-stamp reference. No horizontal/diagonal stripes through lettering. Stamp Book impression masks/background stripes also removed. Keep the enlarged seal and its existing #stamp-invite action. Browser checked layout with companion and Stamp Book opening. Screenshot handoff/verification/abn-stamp-refined.png.

---

# Latest readability and companion update — October 27, 2026

Completed the mobile spacing/readability pass and a second, larger desktop typography pass requested by the owner. Desktop: 16px body/copy (18px feature articles), 14px controls, 13px secondary labels; mobile: compact header, scrollable navigation, safe-area-aware two-row player, single-column content/mixer where needed. Station directions now occupy a dedicated HTML panel BELOW the 3D room; fullscreen temporarily reparents it into an explicit band and restores it on exit. Do not put directions back over the turntable table. Room titles/controls have opaque contrast panels. CMS labels/inputs also enlarged.

Companion × button puts him away WITHOUT entering the shop, stops speech/chat/travel and hides the in-world guide. Preference persists in localStorage truth-companion-hidden; navigation “Show companion” restores him. The same put-away action is available in the in-world toolbar. Hidden companions ignore screening-room invitations. Original approved illustration remains intact. Phone home thought bubbles are suppressed when they would collide with navigation; action bar stays inside viewport.

Browser checked 390px and 320px phones, 768px tablet and 1280px desktop: no page horizontal overflow in inspected views; newsroom/gallery/merch/account/Stamp Book, DJ room/mixer, hidden preference/restore, screening playback and fullscreen enter/exit. Existing 19 Node + 17 Python tests, TypeScript, source/asset/size checks and SQL invariants pass. Screenshots in handoff/verification/mobile-dj-readability.png and desktop-readability.png. Source/delivery and GitHub/Cloudflare should remain synchronized. Public membership/CMS/payment implementation boundaries below remain unchanged.

---

# Latest hosting handoff — October 27, 2026

GitHub/Cloudflare connections are now authorized and setup is complete at public-preview scope. Read docs/DEPLOYMENT-STATUS.md first; it supersedes older statements below about authorization blockers. Code is pushed to traeabnwebsite-cmd/Truthston.com; Cloudflare Workers Builds automatically checks/prepares/deploys main. https://www.truthston.com/ is live with Active Universal SSL and the room browser-verified. Root domain is correctly routed but the current local upstream resolver temporarily caches old IONOS apex A/AAAA. www and the workers.dev alternate work normally. No old accounts were disconnected; no old Cloudflare token was used. Free domain plan, no paid upgrade. IONOS remains registrar; Cloudflare now provides DNS. Mail records preserved, two missed DKIM records restored, HTTPS enforced. Wrangler config persists exact root/www routes and public preview flags. No real production CMS/membership/payment/media service is activated. Local launch and CMS still work unchanged. See the deployment status document for private backup location and validation evidence.

---

# Current handoff priority — October 27 publishing update

Local publishing is implemented and tested. `cms.html`, `assets/cms.js`, `assets/cms.css`, `server/cms_store.py` and `server/preview.py`. Read docs/CMS-GUIDE.md and docs/CONNECT-ACCOUNTS.md first. Last user addition: CMS MUST edit in-site merch; done for products/images/price/sizes/stock/availability/checkout links. Product edits flow into main merch page and Flare/camo Bumpboxx routes.

Public routes #newsroom, #article/id, #events, #gallery, #merch. Seed: 150 newsroom records (106 published, 44 draft), 113 acquired photos, 138 existing project references as drafts, two past confirmed events, seven prototype products. Article sources retained. Gallery photos cleared by owner. Private canonical content/editorial.json and .local-media are ignored by Git; never upload those or audio masters publicly. Public snapshot assets/content/site.json excludes drafts and private fields. Local same-origin sessions/CSRF are not production identity. Cloudflare CMS/catalog streaming returns 503 until staff/member identity plus D1/R2 adapters are implemented. Public local projects have real range-served MP3 playback; member/purchase remain gated. DJ-eligibility flag is metadata only; mixer still uses Boss Ballin.

Repo/delivery share canonical CMS through ignored .cms-local.json; edits mirror published images/snapshots. Local servers 8765/8766 use the Python CMS server. Launch Preview.command updated in both folders. Do NOT restart a simple static server and expect editor writes to work. Public deployment excludes MP3 masters; generated beat fallback works when local Boss file is missing.

Next chronological step: add Trae GitHub auth, push prepared import without rewriting initial remote history; then configure new Trae Cloudflare account using per-repository CI secrets. Existing CLI GH accounts preserved. Existing CF environment token targets WebFaktory, not Trae. Do not deploy into it. Owner requested additive connections and step-by-step instructions; docs/CONNECT-ACCOUNTS.md provides these. No paid upgrades accepted. Authentication permission approval must be completed by owner.

---

# Claude handoff — Trae Tha Truth

Updated October 27, 2026. Read this file first, then WORK-QUEUE.md. The user dislikes turns ending after a plan/status: execute the authorized job, verify it, synchronize both folders, and only then finish. Finish jobs in the chronological queue before new work. Do not start a new framework or replace the current design.

## Locations and launch

- Canonical repository: `/Users/brandonhughes/Documents/ChatGPT/Trae Tha Truth`.
- Delivery: `/Users/brandonhughes/Documents/Trae Website`.
- Preview: http://localhost:8765/ (repo); http://localhost:8766/index.html (delivery).
- Delivery `Launch Preview.command`: double-click in Finder. Python 3 required; opens first free port 8766–8789. Keep its Terminal window open.
- Start repo manually: `python3 -m server.preview --port 8765` from repository root.
- Main implementation: one `index.html`, vanilla JS/CSS and Three.js 0.160.1 cdnjs module. No frontend build. Assets are external/local. npm is only optional deployment/check tooling.
- Git origin now points to traeabnwebsite-cmd/Truthston.com; fetched its initial main commit. Local import commit prepared on top of that history. Verify git log/status for exact commit state. Push awaits the Trae account connection; CLI currently has only public pull permission. No Cloudflare deployment has been created. Do not use the older WebFaktory Cloudflare token for this project.

## Product direction and completed work

Artist title Trae Tha Truth. Shop ABN Records, CDs and Tapes. Tagline Tha Truth & Nothing but Tha Truth. Cream, ink, brick red, amber, deep green; tactile mixtape/store aesthetic. Names on signs must remain sharp. Official supplied ABN wing/halo logo is in assets/branding. Shop branding only in shop context; Houston city header elsewhere.

Jobs 1–12 are complete at local prototype scope (details and browser evidence in WORK-QUEUE.md and handoff/verification). City is a compressed stylized world, not survey geography or GTA-level production assets. Camera far plane 1600 fixes distant skyline clipping. Registered layout audit: 267 parcels, 128 roads, 207 parking courts, zero registered building/road conflicts. Be Someone has connected approaches and raised lettering sightline. Cybertruck burgundy lower/white upper, black Silverado and amber Lamborghini are near the store. Reference-based Reliant, Astrodome, Astros ballpark, Toyota Center, skyline and dark Transco model are present. Transco immediate surroundings include Waterwall, Galleria/Westin/Galleria Tower I and paired silver Post Oak arches.

Reliant campus uses a negative-Z transform: text boards and field texture counter-mirrored with scale.x=-1. Do not remove that correction. Reliant entrance includes glass doors/steps. Retracting roof ~6 s. Ballpark has three barrel roof sections, blue Daikin roof graphic and slow 24 s roof travel. Calm snaps roof movement. Texans midfield, Astros field and Rockets court logos are locally stored official SVGs; provenance in assets/branding/TEAM-LOGO-SOURCES.md. Rockets court has roof cutaway viewpoint.

138 visible sleeves use 138 distinct local artwork paths. Eight sleeves moved into DJ room to free its doorway. Supplied Boss Ballin MP3 in assets/audio (about 12 MB), 318.093 s; audio starts after gesture. Two decks share the decoded buffer, B one beat ahead (~0.92879 s at estimated 64.6 BPM). User can adjust tempo, linked pitch, cut A/B, auto-chop, scratch forward/reverse. Tempo is estimated, not exact beat-grid detection.

DJ Booth is a separate west room with acoustic panels, console-sized monitors, three modeled Bumpboxx displays and product-only posters. Supplied photos with people are reference-only in handoff/references; do not paste press portraits into room. Former booth footprint has apparel rack/accessory cabinet and Merch viewpoint. Merch opens five concept products, sizes and local wishlist; no live prices/checkout.

Screening room uses one large screen; overlay has a YouTube privacy-enhanced iframe and vertical playlist of 12 catalog videos with local thumbnails. Video embeds require network and embedding permission. No need to download videos. Room audio pauses on opening video.

## Stamp Book and rewards

Homepage ink stamp now reads ABN Approved in its original position. Header Account and recurring invitation open #account/stamp-book, a dedicated page within the HTML. Local display name only; no fake password or email authentication. Storage `abn-stamp-book-v1` contains name, awards, events, append-only-looking local credit ledger and demo redemptions. This is client-editable, not authoritative production security.

Four automatic, once-per-stamp activity awards:
- Crate Digger: 5 distinct release openings, 50 credits.
- Street Certified: 4 distinct city button viewpoints, 30 credits.
- The Truth: 60 visible seconds of preview playback, 40 credits.
- Chopped In: 4 manual crossfader cuts during playback, 25 credits.
ABN Approved/Guerilla Maab require verified staff/affiliate awards and remain locked. Project Collector remains locked until actual eligible full-project downloads exist. Daily crate challenge keeps its separate legacy local counter (`truth-stamps`). Official approval graphics are branding, not a claim that a demo user received personal endorsement.

Permanent stamps are never spent. Rewards tab has three explicitly demo offers (100/75/150 credit costs), eligibility, ledger, one redemption per offer, insufficient-balance protection. No real order, shipping, discount or giveaway. Future production must validate every award/redemption server-side. Community tab gives planned ideas: crate hunts, moderated chop sessions, listening rooms, opt-in public books, verified event stamps, member votes/drops.

Test browser has name ABN Preview and four earned stamps, one demo 100-credit redemption, balance 45. This is not a seeded production member. Fresh browsers start empty. No local test state is baked into index.html.

## Code landmarks and pitfalls

Search functions `release`, `deck`, `setCrossfade`, `updateDJ`, `video`, `merch`, `bookEvent`, `checkBookAwards`, `renderBook`, `redeemReward`, `go`, `setMode`. 3D setup is inside async IIFE; sceneAPI exposes travel/city/roof actions. Station indices 0 Crate, 1 DJ, 2 Screens, 3 Street, 4 Giving, 5 Merch. Never renumber without checking all scene and UI handlers.

`label()` MUST use MeshStandardMaterial (map + emissiveMap) because many downstream objects mutate emissive; using Basic caused uniform errors and disappearing geometry. Canvas label text has high resolution and texture anisotropy. Do not restore random grain over sign lettering. Performance lowers pixel ratio below 40fps, hidden tabs pause rendering, account page skips 3D rendering. Reduced/Standard accessible grids are available; all 3D actions have HTML twins. Do not remove fullscreen in-room controls; top + bottom exit must stay reachable.

## Cloudflare / GitHub readiness

Read CLOUDFLARE-PLAN.md for current official sources and rollout. Recommendation: Workers Static Assets + D1 + private R2 audio + Stream video, Better Auth/D1 for consumer accounts, Stripe for checkout/subscriptions and verified webhook entitlements. Supabase is optional, not necessary for this plan.

This is a scaffold, NOT implemented production authentication/billing. Worker serves static assets, truthful /api/health and fails closed for unconfigured private/member routes. No D1/R2/Stream bindings provisioned. SQL migration includes members, award uniqueness, immutable credit ledger, overdraft guard, redemptions, entitlement/payment event records. Better Auth schema must be generated for chosen package version later. `public/` is generated from index/assets only. Supplied preview audio is public in this preview; paid media must never enter public assets.

Commands: `npm ci`, `npm run check`, `npm run prepare:assets`, `npx wrangler deploy --dry-run`, optionally `npm run dev:cloudflare`. GitHub check workflow and manually dispatched Cloudflare deployment workflow prepared; user must configure remote/environment/account/token before deployment. No deployment was triggered. Avoid publishing research/private source/reference files.

## Verification and next work

Source syntax/asset/size checks, strict Worker type check, four Worker tests and SQL invariants pass. Wrangler dry run and local HTTP static/health/private responses pass. Browser verified actual audio, A/B offset, pitch, reverse scratch/cuts; roof endpoints, landmark signs/logos, distinct covers, screening selection, new DJ room/merch, four activity stamps, local persistence, redemption/disabled repeat/insufficient balance. New console errors absent.

Next job should come from the user. Production phase still needs account provider configuration, auth endpoints, payment credentials/webhooks, private-media delivery, server award validation, real merch inventory/fulfillment, real giveaway rules, moderation, mobile/low-end performance profiling and broader device/accessibility QA. Do not claim these are live. Update this handoff and queue after every substantial change; copy source/assets/docs to delivery and verify identical served HTML.

## DJ entry and Bumpboxx shopping — October 26, 2026

DJ Booth entry points now enter the 3D room first. Select either physical turntable or the Select turntables HTML control to open the mixer. Dock and release-room DJ links follow the same room-first flow; no-WebGL fallback offers an explicit turntable-selection button. Gray Bumpboxx info modal and its gray wall photo were removed. Every modeled Bumpboxx opens the dedicated #shop/bumpboxx merchandise page with display selection, product imagery, apparel link and return-to-DJ navigation. Shop Bumpboxx links to the verified official catalog (Flare collection or all products); current stock/colors and payment are handled there, not by a fake local checkout. Sources: https://bumpboxx.com/collections/flare-8 and https://bumpboxx.com/collections/all . Browser checked room entry, explicit mixer selection, merch route/product selection and return. Cache-busted preview URL uses ?v=dj-room-20261026c .

## Companion — latest direction, October 26

Read COMPANION.md. User chose the fourth/latest generated set: black tee, red hoodie variant, diamond ABN chain, grill, earrings, watch and bracelet. User explicitly REJECTED the new procedural 3D character and asked to restore the original illustration. Final code uses buildCompanionIllustration + initCompanion; do not bring back the rejected model. Turning is a sequence of illustrated views (no scaleX card flip), not full 3D. Canvas layers add small leg steps while dragging and a downward head tilt while typing; cursor proximity uses the waving pose. Keep the compact dark pill immediately under the shoes, expanding only for chat/voice/store. Thought cloud must be small, rounded and softly shaded, never a rectangular message card. Chat composer at the bottom, with answers above it. Voice is browser SpeechRecognition + normal device speechSynthesis, no cloned artist voice. Support depends on browser/microphone permission and actual mic capture has not been tested.

The companion is now wired to Bumpboxx, ABN apparel, projects, memberships/Stamp Book and site questions. Local catalog guide is honestly labeled; optional live AI is implemented in cloudflare/companion.mjs with trusted catalog, origin/size validation and rate limiting. Optional config wrangler.companion.jsonc; default config remains no live AI. No deployment/inference was performed. Generated Env types come from optional config; npm run types uses that config. Eight Worker tests, strict type/syntax/assets/SQL checks and optional-config Wrangler dry run pass. Latest preview ?v=companion-classic-20261026d. Both folders must remain synchronized.

## Latest companion correction — home chamber / intact poses

User requested a dedicated home chamber between the headline and ABN stamp at startup. Implemented companion-home in the hero; drag detaches into a fixed overlay, reload resets to home. Earlier saved positions are no longer restored. Procedural character remains removed. All segmented head/leg cuts are removed because they split wrists and legs; render whole approved poses during dragging/typing. User explicitly prefers no leg movement to seams. Keep bottom chat and compact icon bar at the feet, small shaded thought cloud. Browser checked home placement, drag to fixed positioning, reload to absolute home positioning. Repo and delivery synchronized. Latest preview ?v=companion-home-20261026f.

## Latest work — doorway and cinema

Read THEATER.md before changing this feature. Opening green ABN doorway replaces the white chamber. It closes/fades to a brass marker; click for room destinations or drag him onto it. Existing approved character art enters the 3D world as a depth-tested billboard, routes from DJ/screening doorways, and returns upstairs. Do not restore the rejected procedural avatar or segmented legs.

Screening now fills browser content with a projector POV and optional native room fullscreen. One embedded YouTube player is mapped to the physical screen; a hover-revealed horizontal film strip sits above the screen. Strapped Up J8fztJ29L7E is included; actual playback was verified. This upload is a third-party mirror, with provenance in THEATER.md. Actor sits in the existing x15,z-1.3 front-row seat, viewed from behind, eating popcorn only while player state is PLAYING. End state turns him back and offers another video without auto-playing it.

Hybrid rendering matters: WebGL renderer alpha=true; scene background becomes transparent during cinema; four wall/frame strips leave the screen opening; a colorWrite:false/depthWrite:true mask blocks far city geometry behind the movie aperture. The iframe is behind the canvas, with screen pointer events disabled during cinema so player controls work. Chairs and actor remain in front of video via normal depth rendering. Do not move the iframe above the scene again or it will cover the audience. Theater loop capped ~24fps to reduce GPU load.

Eleven tests pass, including three real-source cinema state/projection tests in scripts/cinema.test.mjs. Latest browser verification confirmed clean Hit playback with no city/old-menu overlays, centered seated rear-view companion, carousel hiding/reopening/switching, Escape dismissal and accessible native fullscreen exits. Strapped Up was slow to load in this run; earlier successful playback is documented. Screenshot handoff/verification/theater-clean-20261026.png. Latest preview ?v=theater-clean-20261026a. Source/delivery synchronized. No cloud deployment or live AI connection.

## Latest theater cleanup — October 26

User screenshot revealed city geometry through the screen and duplicate legacy 3D menus. Removed those labels/buttons. Screening camera now uses layer 1 for theater-only geometry, lights and guide; ordinary room camera uses layer 0. Theater objects retain both layers so they remain visible from the shop. Keep the transparent WebGL aperture/depth mask. Registered all four seated poses by alpha bounds at a common height; anchored companion to the chair rather than the aisle. New burgundy chairs include armrests/cupholders. Film strip is horizontal above screen, initially open, hides on selection, returns on hover/focus/click, Escape closes. Hidden list is inert. Browse button opens explicitly because focusin followed by a toggle caused it to immediately close. During movies dock/stations are hidden; Back to shop and fullscreen exits remain. Full validation and current limitations are in THEATER.md.

Latest theater sightline refinement: Screen increased from 7.8 × 4.3875 to 9 × 5.0625 (16:9), raised to y=4.05. Projector eye raised to y=4.15 looking toward y=3.65; companion remains in the same chair, clearly below the picture. Frame and rear-wall opening match the new screen; iframe projection derives dimensions from screen geometry to avoid mismatches. Browser verified actual Hit playback with clear head clearance. Latest preview ?v=theater-projector-20261026a.

## Current job — membership platform structure and build spec

Read BUILD-SPEC.md first, then docs/PLATFORM-RESEARCH.md, docs/MEMBERSHIP-AND-STAMPS.md and docs/MEDIA-INGEST.md. Owner requested thorough provider research, membership/account page design, stamp earning structure and a full completion spec. Stack direction: Workers + Static Assets, D1, private R2, Better Auth/D1, Stripe; Stream baseline but compare Mux with actual video costs/DRM needs; email eligibility/deliverability gate and existing merch operation review. Do not claim a shared Apple/Spotify subscription can serve paid members. Use authorized masters; support bulk catalog intake. Public YouTube viewing is free and not a credit reward source.

Implemented account preview routes: #account/overview, /stamp-book, /membership, /library, /rewards, /community, /settings. Header Account opens dashboard; stamp invite opens book. Device-local display names, preferences, favorite sleeves and old preview ledger remain local, with explicit notices. Free The Family; proposed ABN Vault with null price, inactive in SQL, no live checkout. Existing approved illustrated companion remains.

assets/config/membership-policy.json is the versioned public rule/plan source. Frontend loads it with embedded fallback; internal cloudflare/membership-policy.mjs evaluates only trusted server evidence. It is not a public input/auth validator. Rules: listen60/40credits, dig5 with8sec/50, city4 with5sec/30, manualDJcuts4/25, all once-only. Official ABN/Maab need scoped grants; project stamps have separate canonical IDs and zero initial credits. Future repeatable campaign cap100/day is configuration, not an implemented campaign endpoint. Do not migrate local preview credits to real accounts.

Added migration0002 with scoped role/approval constraints, award-credit trigger, receipts, reserved reward stock/debit guards, single cancellation compensation, plans/subscriptions, playback sessions/download grants, ingest/rights/library and audit structure. Better Auth tables are not generated yet; full project/track/order/outbox/UGC models still need implementation. Real member/auth/checkout/media/reward routes continue to return503. All financial writes must use an atomic D1 batch; SQLite tests do not replace deployed D1 race tests.

The enlarged/raised theater screen from the preceding job remains (9x5.0625, y4.05, projector eye4.15). The separate companion-3d.html primitive/curved-texture experiment was explicitly rejected by the owner ("That ain't it, buddy"). Never integrate/publish that version; it is excluded from public asset packaging. Preserve the approved illustrated atlas.

This job implements design/configuration and local tested foundations, not cloud provisioning or commercial activation. No customer accounts, charges, email or catalog uploads. Finish validation and sync both local copies before reporting. Next backend sequence and owner decisions are in BUILD-SPEC.md; do not skip stage gates or start an unrelated job.

Current job verification: npm run check passes18 tests plus strict Worker types, HTML/assets/size, both SQL migrations and policy/SQL consistency. Browser verified dashboard, seven account tabs, Vault preview dialog, seven stamp definitions, local settings save, library empty state and390px membership stacking/no horizontal overflow; no console errors. Evidence: handoff/verification/member-house-overview.png and member-house-membership.png. Generated public/ contains HTML/assets only. Preview servers8765/8766 were restarted; source and delivery copies match. Real Cloudflare provisioning, auth/email, Stripe and premium media remain future activation stages.

Final live QA also fixed deployment packaging of optional release-data.js: a supplied override is copied; otherwise a valid no-op script prevents Cloudflare SPA HTML being parsed as JavaScript. Embedded/public catalog fallback is preserved.
