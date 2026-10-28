# Upstairs studio/radio handoff — ready for combined review

October 28, 2026. No commit, push or deployment performed by this chat. Work is complete locally and ready for the publishing chat's combined checks.

## Files touched for this request

- NEW `assets/app/world/rooms/broadcast-rooms.js`: radio and recording studio builders, custom geometry, original procedural panel/display textures, equipment, seats, lights, acoustic treatment, glazed vocal booth, console instancing and corridor.
- `assets/app/world/rooms/store-expansion.js`: imported/called the upstairs builder in place of the old primitive rooms. Preserved the concurrent ground-floor edits (rear checkout, left rotated elevator, right merch door), upstairs elevator call/landing and final layer-2 traversal. Keep these concurrent ground-floor edits.
- `assets/app/world/navigation.js`: only the upstairs default camera positions were changed for this request (stations6/7). Preserve all other current navigation/framing work.
- `assets/styles/world-layout.css`: appended a targeted rule hiding the page sprite/cloud/guide controls over station6/7; no unsupported floating companion anchor in these rooms. Other mobile layout work predates this request.
- `assets/app/features/store/controller.js`: Studio-page description now describes the new control room/booth; replaced the emoji mic with a CSS mic.
- `assets/styles/record-store.css`: CSS mic drawing appended.
- `review/STUDIO-REFERENCES.md`: research sources and translated design decisions.

The current bottom station bar and mobile menu removals from the floor-plan chat were preserved. No ground-floor geometry was deliberately moved during this request. Left elevator opening in WABN: x−7.5, z−0.4; existing landing/elevator remain intact.

## Verification

`npm run check` passed after the final geometry and camera changes: 61 JS tests, 19 Python tests, type/source/module/schema checks. `git diff --check` and Prettier check passed.

Browser checks: desktop1440x1000, landscape844x390, portrait390x844. Both rooms retained Immersive and fullscreen, had nonzero rendered draw calls and hidden floating page sprites, and produced no JS page exceptions. Elevator returned to ground floor. Final draw calls were roughly 144–266 depending on room/viewport. Real mobile hardware/Safari remains untested.

Screenshots: `output/playwright/rebuilt-radio-{desktop,mobile,portrait}.png` and corresponding `rebuilt-studio-*`. Latest results: `output/playwright/studio-final-review-result.txt`. Final check log `/tmp/truthston-studios-final-check.log`.

Existing radio playlist route and Studio placeholder route remain connected. Studio recording/booking are not implemented. See reference report for exact source URLs. No third-party reference photos/logos were added as site assets.

Naming follow-up: broadcast-rooms.js now uses Studio ABN on the physical sign, console texture and accessible interaction labels. Shared nav/page naming and bottom-station ordering remain owned by the floor-plan/publishing chat.
