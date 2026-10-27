# Isolated modularization status

Baseline: `0ba824806733689134918ce6973fc3c11b3f2562` on main, October 27, 2026.

Work branch: `codex/modularize-frontend` in a separate managed worktree. The main checkout, Documents/Trae Website delivery copy and live domain retain the baseline structure plus separately approved OG/favicon releases through3e81bd3 until the owner approves a reviewed refactor promotion. No refactor changes merge to main automatically.

## Rollback and review

The original main commit remains the rollback source. `git diff main...codex/modularize-frontend` reviews this work. The isolated local preview uses port8767. Do not use the old production-configured deploy command for this branch; no Cloudflare route or credential change is required for local staging. GitHub branch pushes run validation only. After the owner requested visible changes at the usual preview URL,8765 was pointed at this worktree.8767 is an alternate working preview;8766 remains the stable delivery version.

Visual fixtures are the approved screenshots in handoff/verification. Routes, storage keys and source hashes are captured in baseline.json. Feature extraction preserves hashes, demo identities and policy; this job never activates paid/member/cloud CMS services.

## Slice gates

- R0 COMPLETE: isolated branch/worktree, rollback commit, baseline routes/storage/hash inventory, recursive ES module/CSS asset validation;21 Node+17 Python tests and types/schema pass. Private media and CMS state are isolated in this worktree. No production refactor deployment.
- R1 COMPLETE (cascade-preserving extraction):105297 original CSS bytes moved into nine ordered stylesheets plus the existing stamp stylesheet. Formatted for readability; font sizes, line heights, families, colors,35 stamp cards and zero overflow matched baseline at390/768/1280px. Original cascade overrides are retained deliberately; deduplication/redesign is not mixed into extraction.
- R2 COMPLETE: native module entry, explicit display state, DOM/random helpers, catalog/fallback/sample/cover modules, public-content and optional-override clients, router with teardown.138 release positions and existing hashes/storage identities preserved. Direct data/router tests include failure fallback, CMS reconciliation and single-listener disposal.26 Node+17 Python tests pass; browser verified35 stamps/138 releases, newsroom/gallery/account navigation and Back with no new errors. Packaged public module graph validates. The remaining runtime in main.js is a temporary extraction boundary, not the final architecture.
- R3 COMPLETE: account/Stamp Book, editorial/gallery/events/merch, Bumpboxx and catalog/release/share are feature factories with explicit dependencies and destroy hooks. CMS has separate API, chunk upload, default records and form editor modules, preserving its URL. Browser checked138 releases,35 stamps, ordinary routes, release modal, and real private draft save in the isolated CMS; test state restored afterward.29 Node+17 Python tests pass, including extracted CMS transport/chunk/default tests; source and packaged import graphs validate. No production publishing/account service activated.
- R4 COMPLETE: DOM-free Web Audio transport, independent player scheduler, and separate DJ mixer. Two synchronized decks, pitch continuity, equal-power cuts, reverse grains and generated fallback have direct tests. Browser played the private preview in Standard/WebGL-fallback mode, opened the mixer, cut to B and set linked pitch to75%; dock clock/offset continued.39 Node+19 Python tests, types/source/schema pass.
- R5–R8 pending; each must record its completion evidence before the next.

Owner-prioritized visual/content jobs completed after R3: integrated OG-style house banner, companion cloud/put-away fixes,66-photo unique gallery and real event calendar. These remain on this branch. Current regression count36 Node+19 Python tests, plus source/types/schema checks. The gallery/cloud publishing distinction remains explicit. R4 is now complete; audio no longer needs a world render loop.
