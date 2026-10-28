# Truthston — monolith breakdown and migration plan

October 27, 2026 · R0–R8 implemented on `codex/modularize-frontend`.

See [implemented architecture](docs/refactor/ARCHITECTURE.md) and [slice evidence](docs/refactor/STATUS.md). The original migration plan below is retained as the acceptance register; proposed filenames are superseded by the actual module map. The branch remains separate from production.

## Decision

Convert the existing public frontend to feature-owned browser ES modules and styles, retain vanilla JavaScript and the approved design, and keep Cloudflare as the deployment platform. Keep the source in the existing repository and initially keep one public Worker API deployment. This is a modular application, not a microservice migration.

The first instruction requested one HTML file without a build step. That was appropriate for the prototype. The owner now requests a plan to break it down. The future source can retain a no-compilation local workflow while using multiple files: a small index.html loads an ES module entrypoint and CSS files through the existing local server. Do not start by changing frameworks, redesigning the UI or splitting identity/credits across databases.

## Problems to remove

1. CSS, content, account demo state, audio/DJ, YouTube, companion and procedural geometry share index.html and its enclosing scope.
2. Later CSS overrides make it difficult to determine which rule owns a layout and invite spacing regressions.
3. The scene animation loop also advances DJ/player UI work. Audio should not need a running WebGL scene to maintain its clock.
4. The sceneAPI bridge is useful but informal; callers know too much about room internals and DOM state.
5. Catalog references/companion knowledge/editorial drafts duplicate related data. Title/index-based identities need an explicit normalization adapter before production IDs change.
6. Theater tests extract source substrings rather than importing modules. Source checks parse inline scripts, so naive extraction would silently reduce coverage.
7. Asset packaging currently copies only index.html, cms.html and assets. New module paths will not deploy unless the packaging contract changes.
8. CMS files are separate, but the editor is still one dense script. Local filesystem persistence must not be mistaken for cloud multi-user publishing.

## Target source layout

Names are proposed; maintain stable URLs or compatibility adapters during migration.

```text
index.html                       semantic shell and mount points
cms.html                         staff-console shell
assets/
  styles/
    tokens.css                   palette, type, spacing, motion tokens
    base.css                     resets, focus, shared controls
    shell.css                    header, navigation, player placement
    rooms.css                    room labels, station panels, fullscreen
    editorial.css                newsroom, gallery, events
    account.css                  account and Stamp Book
    commerce.css                 store and product views
    companion.css                guide, chat and thought cloud
    dj.css                       turntable/mixer UI
  app/
    main.js                      composition root; initialization only
    core/
      router.js                  one route owner and compatibility hashes
      app-state.js               serializable UI state; no financial authority
      lifecycle.js               mount/unmount and disposal
      dom.js                     escaping/accessibility helpers
    data/
      catalog.js                 current-data adapter and stable-ID map
      content-client.js          public content API/fallback
      schema.js                  browser-safe record validation
    services/
      account-client.js          preview/live adapters
      activity-client.js         bounded signals, never trusted credits
      commerce-client.js         external/connected checkout adapter
    features/
      catalog/                   grid, release overlay, share card
      audio/                     engine, transport, analyzer, dock
      dj/                        deck state, scratch, crossfader, mixer UI
      theater/                   provider, controls, screen projection
      editorial/                 newsroom, article, gallery, events
      account/                   dashboard, library, settings
      stamps/                    definitions, render, local demo adapter
      commerce/                  merch/Bumpboxx product views
      companion/                 illustration, chat, voice, portal
      world/
        scene.js                 renderer, camera, resize, lifecycle
        navigation.js            orbit/stations/city travel
        picking.js               action IDs and HTML-twin bindings
        materials.js             textures/material ownership
        rooms/                   store, DJ room, theater, giving, merch
        city/                    placement/roads/bridge/skyline
        landmarks/               Reliant, Astrodome, ballpark, arena, Transco
        effects/                 lighting, ink, visitors, beat response
        guide-adapter.js          in-world companion placement
  cms/
    main.js                      editor composition
    api.js                       authenticated or local adapter
    uploads.js                   chunk/resume and progress
    editors/                     articles/photos/events/projects/products
  config/                        published browser-safe definitions
  content/                       sanitized public snapshot
  covers/gallery/branding/...    public assets only
cloudflare/
  worker.mjs                     composition and route dispatch
  routes/                        add as real endpoint groups are implemented
  domains/                       identity/member/catalog/awards/billing
  repositories/                  D1/R2 adapters
  companion.mjs                  optional AI provider, already separate
server/                          trusted-local Python preview/CMS adapter
migrations/                      forward-compatible application migrations
scripts/                         checks, packaging, imports
```

A feature directory is not automatically a new deployed service. Do not create dozens of empty modules solely to match this tree. Split at actual ownership/test boundaries. Third-party dependencies remain pinned; no master audio, secrets, staff drafts or private history enter the public asset tree.

## Contracts that keep features independent

- **Router:** owns current page/station intent, browser history and route lifecycle. Feature links request navigation; they do not independently manipulate all body classes.
- **Catalog:** supplies stable release/track records and asset IDs; existing index/hash links remain mapped during extraction. Normalize IDs in a separate tested change instead of silently changing identities.
- **Audio:** exposes load/play/pause/seek/volume and current state; publishes bounded analyzer levels and transport state. DJ owns its deck/crossfader state and uses the audio engine. Neither imports renderer/camera code.
- **World:** mount/navigate/setEffects/setGuide/destroy via a small facade; receives catalog and analyzer input. Publishes selected action IDs. It does not read member balances or call billing.
- **Theater:** owns provider/player lifecycle and play/end/error state. Receives a screen-geometry projection adapter from world. The provider does not import city/venue model builders.
- **Companion:** owns illustration/chat/voice/promotion/dismissal state; world placement is an adapter. Hidden state blocks room entry. It requests navigation/store actions through injected commands.
- **Account/stamps:** use an explicit preview adapter today and authenticated APIs later. Local demo totals cannot pass into production award/ledger repositories.
- **CMS:** editor field models depend on a content repository/upload interface. Python filesystem and future D1/R2 implementations honor the same tested semantics; cloud staff authorization wraps every privileged operation.

Prefer direct ES imports and explicit arguments for internal dependencies. Use a small set of typed/JSDoc event payloads for real cross-feature notifications. Do not replace the current closure with a large window-global object or an unrestricted event bus that hides every dependency. Browser display state and server-authoritative member/credit state remain separate.

## Gated extraction slices

| Order | Work and scope | Completion gate |
|---|---|---|
| R0 — baseline and tools | Create codex/modularize-frontend branch; record visual/interaction fixtures, routes, storage keys, release IDs and deployment baseline. Make source checks/module tests/packager explicitly support assets/app and styles; protect private-path exclusions. Establish staging preview and rollback artifact before risky changes. | Existing npm checks pass; packaging validates every referenced/imported module; baseline workflows recorded; production remains unchanged. |
| R1 — CSS ownership | Extract styles in existing cascade order first. Then consolidate one feature at a time into tokens/base/shell/feature/responsive rules. Move stamp SVG/data artwork to a reusable renderer or public asset without losing accessible button labels. | Matched screenshots and computed reading sizes at phone/tablet/desktop; no layout/contrast/focus/fullscreen regression. Extraction and cleanup are separate reviewable steps. |
| R2 — data and core | Extract published-content client, catalog fallback/optional release-data adapter, helpers, router and app state. Preserve existing hashes/local storage and current fallback behavior. Format readable source. | Direct links/Back/reload/Standard mode and offline/content failure tested; no duplicate route listeners; old release links map correctly. |
| R3 — ordinary pages and editors | Extract catalog/release/share, editorial/gallery/events, account/Stamp Book and merch. Give each mount/destroy lifecycle. Format and split CMS API/uploads/editors, retaining local storage backend. | Every public/account route and local editor still works; local draft/publish/merch/multitrack upload/validation unchanged; no production services falsely activated. |
| R4 — audio and DJ | Extract transport, generated beat, decoded file source, analyzer, scratch/crossfader and dock. Move clock/progress updates out of scene RAF to an audio-owned scheduler that respects visibility. | Play/seek/pause and two-deck cut/scratch function in Standard mode, room mode and after room teardown; video pauses music; errors/fallback and hidden-tab audio policy tested. |
| R5 — theater | Extract YouTube/provider lifecycle, carousel and pure projection math. Replace substring-based cinema tests with direct module imports. Keep world lighting and screen geometry behind adapters. | Real play/switch/end/error/exit plus four-corner projection and head sightline tests; no city overlays or duplicate player instances. |
| R6 — companion | Extract illustration, chat, voice, promotions, dismissal and portal/world bridge. Preserve intact approved artwork and stored hidden preference. | Put-away/reload/restore, drag, chat, room entry/return and seated movie behavior pass; hidden guide cannot re-enter through video events. |
| R7 — 3D world | Extract renderer/camera/input, room builders and city/landmark modules using shared material/geometry utilities and registered placement data. Add start/suspend/resume/dispose ownership and lazy import. | Every station/landmark/roof and 360-degree orbit checked; no duplicate renderers/listeners; independent disposal; WebGL failure does not break ordinary pages/audio. Profile actual frame/memory improvements. |
| R8 — API boundaries and cutover | Keep the small Worker shell; add route/domain/repository modules only for implemented APIs. Introduce preview/live adapter contracts and staging configuration. Remove legacy inline executable/style blocks and temporary bridges after parity is proven. | Main entry is composition only; no feature-sized inline code or circular imports; checks/test imports/package paths updated; source/delivery/staging parity; controlled release and previous-version rollback rehearsed. |

Do not impose an arbitrary index.html byte target that merely moves the monolith into app.js. The acceptance criterion is ownership, explicit dependency direction, independent tests and lifecycle control. Generated data/assets can legitimately be large in separate files.

## Migration discipline

1. Complete one slice and its evidence before the next. Keep each commit coherent and reversible; preserve a known-good deployed version.
2. Existing production preview remains available. Changes first run locally, then in an isolated preview/staging deployment, then through the established production path.
3. Keep hash URLs while extracting. A move to path-based URLs is a separate routing/redirect task.
4. Do not combine extraction with identity activation, pricing changes, bulk private uploads or ledger migration. No financial state is trusted from localStorage.
5. Track mount/destroy cleanup: DOM handlers, RAFs, timers, observers, audio sources, YouTube players, Three textures/materials/geometries and renderer/context resources. Shared resources need explicit owners.
6. Handle partial load/import failure with readable fallback. A feature can fail without blanking the whole site. Coordinate audio/video/companion state through contracts rather than broad shared variables.
7. Native module caching must not mix incompatible HTML/modules on rollout: use a coherent asset-version strategy, retain prior immutable assets during deployment/rollback, and verify with warm-cache as well as fresh sessions.
8. Extend current checks to import modules directly and validate import graphs/assets. Preserve existing policy/SQL tests. Add meaningful feature-contract/browser tests for the moved boundaries rather than tests that merely assert filenames or mirror implementation.
9. Keep Cloudflare assets/API configuration and launchers aligned with the new tree. The Python server already permits files under assets; modules there can preserve that public-path boundary. MIME types, strict missing-file behavior and no SPA-HTML-as-JS fallback must be checked in production.
10. Mirror the final source to Documents/Trae Website after each accepted slice, update handoff/status, then promote the reviewed release. Never overwrite private CMS state/uploads when syncing code.

## Final refactor acceptance

- Public catalog/editorial/account/merch modules can load without constructing the 3D world.
- Audio and DJ have no renderer dependency; theater and guide can be tested with a fake world adapter.
- Landmark builders can be changed/tested without editing member/account logic.
- Styles have clear owners and preserve the larger readable type and approved stamp/companion presentation.
- Preview state and production API adapters are explicitly distinct.
- A failing optional feature produces a useful fallback; no uncontrolled global application state or circular module imports.
- All current checks plus direct module/boundary tests pass; representative real-browser/device workflows pass; no claimed performance gain without measurements.
- No real member/billing/media service is claimed complete just because the refactor is complete.

## Next release after the refactor

Proceed to P1–P8 in BUILD-SPEC.md: real identity/staging/storage, cloud publishing, private media, verified stamps, billing, commerce/rewards/private video, then launch acceptance. Modularity makes those jobs safer; it does not implement them by itself. There is no estimate or committed delivery date in this plan.
