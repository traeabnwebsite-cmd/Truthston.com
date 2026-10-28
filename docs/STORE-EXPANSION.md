# Record store expansion and floor plan

October 28, 2026. Owner approved publishing the complete shared expansion, including the upstairs rebuild coordinated with “Develop and critique platform vision”.

## Ground floor

Checkout is centered at the back (x0, z−3.4), with Reign behind it. The counter body, top, character and badge open checkout. The former Giving map/table/board and Giving destinations are removed from the record store; a dedicated Relief Gang room is future work.

The elevator is on the left/DJ wall at z−0.4. Its upstairs landing aligns with the opening in WABN. The DJ doorway remains at z2.6. Screening is directly opposite at z2.6 on the right wall; the right wall also has a separate merch entrance at z−0.4. Both side shelves end in the rear sections, before the doors. Camera orbits stay within the closed side/back walls and below the shop ceiling while retaining the wide front cutaway.

Desktop and mobile navigation use: Record Store, DJ Booth, Screening Room, Merch Store, Streets; then WABN Radio and Studio ABN. Streaming, Purchases and Checkout are no longer separate bottom-bar items. Their actual shelves/counter and pages remain accessible. Mobile menus explicitly group the floors.

## Expansion scope

Chronological shelves, streaming/release pages, a device-local release crate and free preview checkout, Reign’s sourced local catalog guide, WABN playlist collections, elevator and two rebuilt upstairs spaces. WABN has a shared interview desk and microphones; Studio ABN has a console, monitoring wall, racks and a separate glazed booth. See review/STUDIO-REFERENCES.md and review/STUDIO-REBUILD-HANDOFF.md for the other chat’s source and verification record.

This is an open-house prototype. Checkout collects no payment, grants no paid ownership and delivers no unavailable master. The guide is a local catalog lookup, not a live artist conversation. Radio plays connected public/free tracks, with the supplied Boss Ballin rendition as the current fallback rotation. Membership, premium-media access, uploads, booking and studio recording remain separate implementation work.

## Verification

80 automated tests (61 Node, 19 Python), type/source/module/schema gates. Browser review of rear checkout, both door walls, desktop station order, mobile fullscreen/menu order, no phone horizontal overflow, and no Giving destination. Store add-to-crate, free confirmation and radio route exercised. Upstairs desktop/portrait/landscape verification is recorded in the shared handoff. Evidence: handoff/refactor/store-floorplan-audit.json and final-store screenshots. Physical iOS/Android hardware remains untested; software WebGL checks do not establish production device performance.

Production packaging retains the preceding live modular commit b3ba1dc as the rollback code tree. Source MP3 masters remain excluded; only the owner-approved public Boss Ballin playback rendition is published.
