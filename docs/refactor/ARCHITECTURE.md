# Truthston modular application

Completed October 27, 2026 on `codex/modularize-frontend`. This describes the implemented prototype architecture, not a production subscription launch.

## Ownership

| Area | Implemented entry / owner |
|---|---|
| Browser startup | `assets/app/main.js`: three-line entry; `application.js`: factories, injected ports, startup and teardown |
| Shared runtime | `core/`: display state, routing, DOM helpers, random source, resource lifetime, keyboard twins and lazy feature loader |
| Public catalog | `data/` and `features/catalog/`: stable release identities, data fallbacks, covers, challenge, release/share views |
| Audio | `features/audio/engine.js`: DOM-free Web Audio graph, transport and scratch voices; `dock.js`: independent player clock and controls |
| DJ | `features/dj/mixer.js`: two-deck controls, scratch gestures, pitch and crossfader |
| Theater | `features/theater/`: catalog, provider/controller lifecycle, tested projection math and world screen adapter |
| Companion | `features/companion/`: illustration, chat, voice, local knowledge, promotions and journey; approved artwork retained |
| Pages | Account/Stamp Book, editorial/gallery, events/calendar and commerce factories in `features/` |
| Site chrome | `shell/`: mode/reduced motion, fullscreen/focus, navigation, community panels, home summary, modal/toast/local meter |
| 3D | `world/controller.js`: composition; separate room builders, city/street/freeway/infill builders and individual landmark modules |
| World runtime | `world/navigation.js`, `input.js`, `animation.js`, `room-guide.js`, `dispose.js` |
| CMS | `assets/cms/main.js`, API/uploads and record/default editors; same local Python CMS contract |
| Backend | Existing small Cloudflare Worker routing shell; companion and membership policy already separated. No invented member/payment/CMS service |
| Styles | External ordered stylesheets, stamp/hero/calendar presentation. Original cascade intentionally preserved during extraction |

There is one repository and one public Worker API boundary. No React conversion, frontend compiler requirement or microservice split was introduced. Large catalog literals and procedural geometry belong to data/landmark modules; the old shared feature scope is gone.

## Runtime contracts

- `createApplication()` composes services and returns `state`, `services` and an idempotent async `destroy()`. Cross-feature access is injected as ports rather than ambient globals. It can be destroyed/remounted without duplicate views, controls or keyboard twins.
- Ordinary routes and Standard/phone mode do not construct WebGL. The world is imported lazily, concurrent requests share one constructor, failed loads can retry, and late results after disposal cannot mount. The loader receives an abort signal for pending initialization.
- Audio owns its context, two synchronized transport heads, analyser and notifications. Its dock clock does not run inside the renderer. Video pauses music through the audio port. No audio starts without a user action.
- Scene geometry builders receive explicit materials/helpers/data and return only the resources/state needed by navigation or animation. Roof state is owned by its venue module. Orbit state has one shared owner for navigation/input/animation.
- Renderer start/suspend/resume/dispose controls own their RAF, observers and input handlers. Shared geometries/materials/textures dispose once. Page visibility does not override an explicit suspension.
- Theater callbacks carry a selection generation so old video events cannot change the next selection. YouTube loader cleanup restores the prior callback and cancels its timeout. Projection math is directly importable for tests.
- Companion timers, voice, observers, scene projection and portal generations have teardown. Hidden companions cannot return through video events. The house door remains available when the character is put away.
- Financial balances and official approvals remain outside display state. The existing fail-closed membership/media/checkout/CMS boundaries remain in force.

## Delivery and rollback

`npm run dev` serves source natively with the local CMS; no frontend build is needed. Current source preview is port 8765; 8767 is an alternate.8766 and the live site are the protected stable version.

`npm run prepare:assets` creates `public/`, excludes MP3 masters/private CMS/research files, and snapshots JS/CSS into one content-addressed native-module tree. CSS bitmap URLs continue to reference public images without duplicating them. The package retains rollback code from `TRUTHSTON_ROLLBACK_REF` (default production baseline `3e81bd3`). Update that reference to the actual approved live revision for subsequent promotions. `release-manifest.json` records current/retained code hashes. HTML revalidates; code snapshot paths are immutable. Both original source and packaged module graphs are checked.

`wrangler.staging.jsonc` uses a separate Worker name and no custom-domain routes. Preview commands and the manual preview workflow use that config. `wrangler.jsonc` remains the explicit production configuration; neither it nor staging uses an HTML fallback for missing JS/CSS. No Cloudflare deploy or main merge was performed by this refactor.

Before an owner-authorized promotion: retain the then-live revision, run checks/package validation, inspect the staging artifact and promote the reviewed branch through the normal production path. Roll back by redeploying the recorded previous revision/artifact. Local packaged Worker checks verified the retained-code manifest, asset MIME/cache behavior, real missing-module404s and protected-route503s. A future cloud deployment still requires its own environment check.

Cloudflare configuration references: [headers](https://developers.cloudflare.com/workers/static-assets/headers/), [workers.dev isolation](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/), [asset HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).

## Evidence

- 51 Node tests and 19 Python tests; Worker type checks, schema invariants, source/assets and dependency-boundary checks pass.
- 79 application/CMS modules checked for cycles; ordinary static imports do not include the world; audio transport has no DOM/world dependency.
- Seeded before/after geometry fingerprint identical for4,874 objects: `handoff/refactor/world-geometry-parity.json`.242 building parcels,166 street segments,138 unique sleeve images and zero road conflicts retained.
- Real Three/WebGL smoke rendered the room. It used software rendering; no production FPS improvement or GTA-level graphics claim is made.
- Application disposal/remount evidence: `handoff/refactor/application-lifecycle.json` (138 releases/211 twins preserved, one companion and one cinema after remount).
- Final browser evidence: `handoff/refactor/final-browser-check.json` (66 unique photos,35 stamps,31 calendar days, Boss Ballin playback, cut B,75% pitch, zero phone overflow/page errors).
- Packaged local Worker HTTP evidence: `handoff/refactor/packaged-http-check.json`. Private masters remain excluded and protected routes remain unavailable until production services are implemented.

Existing CSS overrides, compressed city geography, local-only account/reward demonstrations and unconfigured production services are documented product limits, not unfinished module extractions.
