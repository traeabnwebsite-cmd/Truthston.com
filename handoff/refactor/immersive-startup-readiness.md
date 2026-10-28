# Immersive entry readiness follow-up

October 28, 2026. Local change only; no commit/deployment by this chat.

Independent live verification of release d038ad231ab52743a89a passed for WABN Radio and Studio ABN at390x844 and844x390. Both rooms rendered, retained Immersive/fullscreen and allowed elevator return to station0. No JavaScript page exceptions in the completed live run. Evidence: output/playwright/live-upstairs-result.txt and live-{wabn,studio-abn}-{portrait,landscape}.png.

Found an early-startup race on the live release: createWorldLayout renders the mobile Enter button before async catalog/content startup completes and before the mode button handlers exist. A first tap can therefore call an unbound mode button and be ignored, leaving Standard mode.

Minimal readiness guard added to the current shared files:

- assets/app/shell/world-layout.js: initially disable mobile entry and header mode buttons; show Preparing the 3D world…; expose ready() to restore the original disabled states and entry label. Teardown restores button states too.
- assets/app/application.js: call worldLayout.ready() immediately before returning the initialized application, after navigation, routing and loader initialization are complete.

Delayed-/api/content browser test passed: while startup blocked, entry disabled/preparing; after release, enabled/Enter; first enabled click entered Immersive and fullscreen. Evidence: output/playwright/startup-guard-result.txt.

Do not replace other current changes in these two files; both already include concurrent mobile/fullscreen work from the publishing/floor-plan chat. Navigation order, ground-floor geometry and upstairs room design were not changed in this follow-up. This guard is ready for inclusion in the next combined release.
