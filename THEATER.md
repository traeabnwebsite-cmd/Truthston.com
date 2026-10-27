# Doorway and in-room theater

Updated October 26, 2026.

## Companion doorway

The approved illustrated companion exits a green ABN doorway on arrival. The door closes and fades, leaving a brass return marker. Click the marker to choose the record shop, DJ booth or screening room; dragging the companion onto it sends him into the shop. `Back upstairs` brings him home through the doorway again. Calm/reduced motion resolves transitions immediately.

The in-room companion is a depth-tested billboard using the same animated canvas artwork. He follows paths from the existing room entrances. In the DJ booth he arrives behind the decks. All source poses remain whole; no segmented hand/leg animation is used.

## Theater

Entering Screens expands the room to the browser content area without requiring native fullscreen. The camera stays at the projector end; the room's existing Fullscreen control expands the entire theater, including chairs, the companion and carousel. The YouTube player's own video-only fullscreen control is disabled.

Videos are selected through a horizontal film strip above the screen. It starts visible, hides after selection, and returns on pointer hover, keyboard focus or the Browse films button. Escape dismisses it. Hidden film buttons are inert, so they do not trap keyboard focus. The live privacy-enhanced YouTube iframe is projected onto the actual screen corners with a homography. WebGL uses a transparent screen opening and a depth-only mask so foreground chairs and the companion occlude the movie correctly. This is an embedded YouTube player, not a downloaded video or a texture copied from YouTube.

Lights fade down on selection and back up on Lights up or exit. The player state controls popcorn eating: playing starts the two rear-view eating poses; pause stops them. At video end, he turns back and proposes the next video in a thought cloud. Selection remains manual—there is no surprise auto-next.

He walks down the aisle and occupies the burgundy upholstered chair at x=15, z=-1.3. The seated sprite uses that chair's anchor and seat height. All four popcorn poses are cropped to their actual alpha bounds and centered at a common height, preventing lateral jumps between poses. The rear-view popcorn sheet is `assets/companion/trae-cinema-atlas.png`; standing artwork is unchanged.

### Strapped Up

Added `J8fztJ29L7E`: “Trae Tha Truth Ft Pyrexx of ABN - Strapped Up (Official Music Video)[HD]”. This is a third-party upload by george clowney; the title describes it as an official video, but it is not labeled as the artist's channel in this site. YouTube oEmbed metadata and actual embedded playback were checked. Link: https://www.youtube.com/watch?v=J8fztJ29L7E . Artist-channel audio alternative found: https://www.youtube.com/watch?v=ZhwqerYm2Ns . The local thumbnail is `assets/videos/J8fztJ29L7E.jpg`. Future launch should use the artist's preferred authorized upload. Availability can change; the UI provides an external YouTube link and lets the viewer choose another upload if an embed fails.

## Verification and limits

- Browser verified portal destination selection, arrival behind the DJ decks and return upstairs after fixing two negative-timestamp interpolation errors. Older console messages for `companion-door-20261026a` are historical; the corrected version was checked.
- Browser verified the projector-view carousel, Strapped Up embed and actual NOW PLAYING state, with the room dimming.
- Latest browser check verified clean Hit playback, no city or legacy signs over the image, the centered rear-view companion behind his chair, carousel hiding/reopening, switching uploads, Escape dismissal, and native fullscreen with both exit controls accessible. Screenshot: handoff/verification/theater-clean-20261026.png. Strapped Up initially remained loading during this run; switching to Hit produced actual NOW PLAYING. Earlier Strapped Up playback was verified; individual YouTube upload loading remains network-dependent.
- Theater camera uses a dedicated render layer containing only its architecture, chairs, lights and companion. This prevents distant Houston objects appearing through the transparent movie aperture. The shop still sees the theater architecture on the ordinary room layer. Legacy screen header/footer labels and old 3D video-menu buttons were removed.
- During playback the music dock and station bar are hidden, and theater controls are compact; Back to the shop and fullscreen exits stay available.
- Eleven tests pass: eight Worker/API checks plus three cinema tests covering iframe selection, player state/ending, stopping/switching, and four-corner projection. Strict Worker types, source/asset/size and SQL checks also pass.
- Movie playback remains subject to YouTube connectivity, autoplay policy and embedding permission. Microphone voice capture has not been exercised in automated verification.
- The room's render loop is capped near 24 fps in theater mode to reduce WebGL load alongside the independently rendered YouTube movie. Other room viewpoints retain their normal loop and adaptive pixel ratio.
- Small screens use a simpler positioned player; full projector-view composition is intended for desktop.

Latest preview: http://localhost:8765/?v=theater-clean-20261026a . Repository and delivery folder are synchronized. No cloud deployment or real AI inference was performed.

### Raised screen and projector sightline

Screen increased from 7.8 × 4.3875 to 9 × 5.0625 (16:9), raised to y=4.05. Projector eye raised to y=4.15 looking toward y=3.65; companion remains in the same chair, clearly below the picture. Frame and rear-wall opening match the new screen; iframe projection derives dimensions from screen geometry to avoid mismatches. Browser verified actual Hit playback with clear head clearance. Latest preview ?v=theater-projector-20261026a.
