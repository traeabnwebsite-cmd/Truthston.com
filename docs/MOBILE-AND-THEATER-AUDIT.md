# Mobile, fullscreen and theater correction

October 28, 2026. Implements completion slice C01; release/deployment evidence is recorded below when available.

## Changed

- Phone Standard has its own home document: header/menu, two-column department directory, eight featured sleeves with readable titles, vertically stacked community panels, reserved guide region, account invitation and player spacing. Inner routes keep their own document layout. Original desktop/immersive hero is preserved.
- One fullscreen root contains the shop, DJ, theater, merch/content routes, Streets and both upstairs rooms. Logical session survives orientation-triggered native loss; the menu can restore native fullscreen. Explicit exit restores scrolling/focus. Manifest/Home Screen launch opens the app surface without browser chrome where supported. A CSS fallback cannot remove browser-owned chrome by itself.
- Theater: no Browse films button; vertical selection rail occupies its own right column. Selecting a film hides toolbar, rail, navigation and player. Screen tap/click or Tab restores UI; closing the menu resumes timed hiding. Lighting, return, external YouTube, seek and playback controls live inside the menu. Clear theater state when opening ordinary content so the carousel cannot overlay Merch.
- Removed floating companion action panels from the store; actions are in navigation.
- All nine shop/upstairs/front/back doorway models share2.6×3.7 openings and2.9×3.95 frames.
- Year rows avoid both actual freeway and railway deck footprints. A shared crossing configuration and geometric regression test keep the road builder and sign layout aligned.
- Removed legacy mobile projection overrides. Theater uses canvas dimensions rather than full stage dimensions when the side rail is present; portrait framing allows enough horizontal view for the entire screen. Chat composer/status reserve room above the phone player.
- Companion arrival no longer retravels to the same theater and resets a selected film; Standard theater does not force a3D load.
- Initial mode/world entry stays disabled until application handlers are ready, preventing first-tap startup loss.

## Evidence and limits

- `handoff/refactor/mobile-layout-route-audit.json` and `mobile-layout-extra-audit.json`:126 combinations,18 routes at320/390/430/768/844/1280/1440; no page exceptions or detected page overflow. Screenshot review includes full-page strips, registered account states, release/DJ/timeline dialogs, article, gallery lightbox, share and companion chat. Explicit carousels retain their own scrolling.
- `handoff/refactor/immersive-mobile-room-audit.json`:7 destinations ×2 orientations; native fullscreen retained and root matches viewport; all9 doorway dimensions collected from actual scene. Includes a corrected test that does not click a stale DJ entry button after every destination.
- `handoff/refactor/fullscreen-fallback-audit.json`:same14 transitions with Element fullscreen APIs unavailable; fixed app surface retained; explicit exit releases scroll lock.
- `handoff/refactor/theater-mobile-audit.json`:select→hidden→tap→visible→menu→close→hidden with actual YouTube state reporting playback. Controls parent is navigation; no separate bottom controls. Video availability remains controlled by the external publisher.
- `output/playwright/` holds route, dialog, portrait/landscape room and theater screenshots. These are local review artifacts, not public deploy assets.
- Desktop Chromium with touch/mobile emulation and software WebGL was used. This does not establish physical iPhone Safari/Android rendering, browser chrome behavior, audio permissions or hardware performance. Those device checks remain open; no universal fullscreen or FPS claim.

## Release

Source/types/module boundaries,67 Node tests,19 Python tests,SQL policy checks and packaged509-file reference validation pass. Packaged release416f9c35b249ec1f3a8c retains previous lived038ad231ab52743a89a. Main/Cloudflare promotion follows this audit. No real membership, billing, premium media, cloud publishing or studio recording service is enabled by these UI corrections.
