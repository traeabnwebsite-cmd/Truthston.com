# ABN website — update queue

Complete and verify each job before moving to the next. Keep the repository and `Documents/Trae Website` local preview synchronized.

This is the outstanding update list, ordered by when you requested each job. Earlier implemented work is not automatically considered complete. Jobs 1–13 are complete for the local prototype scope. Production authentication, payment accounts and fulfillment remain a separate integration phase. Later clarifications are included under the original job they refine.

A job is complete only after its requested behavior works, its visual result has been checked in the browser, and the source and local preview copies match.

1. **Complete — City continuity.** Connected streets and freeways; proper landmark surroundings; no buildings in roads at Reliant; raise Be Someone clear of the years; burgundy/white Cybertruck, black 2026 Silverado and a Lamborghini behind the shop.
2. **Complete — Distant building cutoff.** Prevent skyline buildings being sliced away as the camera turns.
3. **Complete — Landmark references.** Rebuild Astrodome, ballpark and Toyota Center; add shop exterior and actual Reliant entrance; match skyline forms and colors to supplied references. Shop branding appears at the shop, city branding outside. Latest supplied Transco photos require a blue-silver stepped tower with dark vertical recesses and a low pyramidal crown. Add actual Texans midfield, Astros field and Rockets venue logos. Complete these landmark corrections before job 8. Immediate Transco surroundings requested: Waterwall Park, adjacent Galleria/Westin/Galleria Tower I, and the silver Post Oak arch from the photo; keep the darker tower glass.
4. **Complete — Preview record.** Use supplied Boss Ballin MP3 and update player duration/seek/audio labels.
5. **Complete — Distinct covers.** Use the research vault's distinct Trae artwork, with no repeated sleeves.
6. **Complete — DJ booth.** Two old-school silver direct-drive decks, both using Boss Ballin; Deck B one beat ahead; working forward/reverse scratch, pitch, linked sync and crossfader chopping. Latest request: move it into a separate room with acoustic panels; fit speakers fully on the console; move Bumpboxx displays into this room. Replace the former shop booth with apparel/accessory racks that open the merch-store preview.
7. **Complete — Ballpark roof.** Slow roof travel and blue Daikin Park roof insignia.
8. **Complete — Signs and shop name.** Keep names sharp/readable; rename shop to ABN Records, CDs and Tapes. Use the user-supplied official winged/halo ABN Angel By Nature logo (`assets/branding/abn-angel-by-nature-official.png`) on store branding. Add a Bumpboxx-branded boombox display near the DJ booth; supplied charity flyer is a branding reference only, not a press-photo texture. Preserve the official ABN mark’s shape/colors and readable wording.
9. **Complete — Screening room.** One large YouTube embed and a vertical scrolling video list. Downloads are unnecessary; videos must permit embedding.
10. **Complete — Hosting and integration.** Recommend Cloudflare-first hosting, storage and database; prepare GitHub/Cloudflare integration for future user accounts and paid entitlements. Do not create accounts, deploy, or charge customers without the corresponding request/configuration.
11. **Complete — Stamp collection / Stamp Book.** Replace the homepage “Houston’s Own Forever” stamp with a convincing ink impression reading “ABN Approved,” retaining its placement. Create a dedicated Account → Stamp Book page, with earned and locked stamps, requirements, progress and earn dates. Include ABN Approved, The Truth, Guerilla Maab, Street Certified and project-download stamps. Repeat the membership invitation: “Join the site. Get stamped. Get approved.” Supporting copy: “Earn stamps from Trae tha Truth, Guerilla Maab and the ABN family.” Artist/affiliate approval stamps require a verified award; ordinary activity stamps must clearly identify their earning rule. Show actual account persistence only when authentication/backend integration exists; label local prototype progress honestly.
12. **Complete — Merchandise rewards and member interaction.** Earned stamps qualify members for rewards, giveaways and merchandise credit. Keep collectible stamps permanently in the Stamp Book; spend a separate redeemable credit balance. Show eligibility, credit costs and redemption history, with server-side award/redemption records when integrated. Proposed interactions: listening milestones, liner-note crate hunts, project completion, moderated DJ chop challenges, optional public Stamp Books, listening rooms, community milestones, member polls and verified event check-ins. Do not imply an activity stamp is a personal artist endorsement or that a giveaway is live until configured. Avoid rewarding spam/repeated reloads; enforce award limits and unique qualifying events.

## Source and preview

- Repository source: `index.html` plus supplied local assets.
- Delivery: `/Users/brandonhughes/Documents/Trae Website/`.
- Launcher: `Launch Preview.command`.
- Local preview: `http://localhost:8766/index.html`.

## Verification notes

- Latest city audit: 269 parcels, 125 street segments, zero generated building/road overlaps and zero Reliant campus building/road overlaps.
- Camera far plane increased from 260 to 1600 world units.
- Landmark geometry follows the supplied photos; geographic distances are compressed for the animated prototype.

- Job 1 browser-checked: overview, raised bridge viewpoint, shop vehicle lot and Reliant campus. Corrected bridge camera elevation to clear I-10. Layout is an animated, compressed interpretation, not survey geometry.

- Job 2: completed 360° keyboard orbit at the Reliant viewpoint; far-plane clipping no longer slices distant structures.

- Job 3 correction: Reliant exterior signs, interior scoreboard text and football-field lettering counter the mirrored campus transform. Entrance camera corrected and front sign/field checked in browser.

- Branding references added October 25: official ABN Angel By Nature PNG, ABN pendant reference, Houston ABN palette reference and flyer showing Bumpboxx wordmark. Secondary references are in handoff/references. The official ABN asset is ready; UI branding was completed in job 8.

- Job 3 verified: reference model views, corrected entrance and field lettering, roof opening animation and endpoint, Transco viewpoint, city/shop heading changes.

- Job 4: supplied Boss Ballin MP3 decodes and plays after gesture; full duration 5:18; keyboard seek to 1:35 and pause verified.

- Job 5 verified: 138 sleeves / 138 distinct artwork paths; final sleeve accessible button opens Rock Out release. Covers now continue around both side walls and bins use remaining artwork.

- Job 6 checked: dual playback, one-beat offset 0.92879 s at estimated 64.6 BPM, linked -25% pitch, A/B cuts, forward/reverse keyboard scratch and pointer drag, auto-chop and manual cut cancellation. Responsive 390px stacked layout and sticky close control checked. Exact song tempo remains user-adjustable.

- Job 7: both directions verified from near-start progress to full endpoint; roof travel uses 24 seconds, with blue Daikin Park graphic on center roof panel. Calm remains instant.

- Latest Transco direction: keep the rebuilt stepped geometry and continuous dark bands, but restore the darker glass appearance.

- Landmark additions checked: darker Transco glass/profile; Texans midfield, Astros outfield and Rockets court logos load from locally stored official team assets; immediate Galleria/Westin/Tower I context, Waterwall Park and paired Post Oak arch. Corrected Waterwall and arch viewpoints. Latest city audit: 267 parcels / 128 roads / 207 parking courts / zero registered road conflicts.

- Job 8 verified: ABN shop interior/exterior logo and text, sharper signs, Bumpboxx display keyboard interaction. Fixed a material mismatch caught during verification; labels retain Standard materials to support existing emissive settings.

- Job 9 checked: embedded YouTube player loads Hit and switches to Rain through the vertical list; 12 catalog videos use local thumbnails; room beat pauses on entering video overlay.

- DJ layout refinement checked: dedicated west room, acoustic panels, fitted speaker faces, three Bumpboxx models and product posters, shop apparel/accessory racks, merch preview/wishlist, and audio offset/reverse scratch retained.

## Final integration verification — October 25, 2026

- Job 10: strict Worker type check, four API routing tests, SQL migration/idempotency/overdraft/append-only checks, HTML syntax/assets/size check pass. Wrangler dry run passed. Local Wrangler runtime serves HTML (200), health (200), protected media (503). No cloud resources or GitHub remote were created.
- Job 11: Account → Stamp Book is a dedicated hash page. Local display name, earning rules, earned/locked state, dates, four activity stamps and official-award-only stamps verified. Distinct release digging, four landmark visits, 60 seconds listening and four manual DJ cuts awarded once. Reload preserved four stamps and the ledger.
- Job 12: demo redemption spent 100 from 120 credits, kept three collectible stamps, disabled repeat redemption and unaffordable rewards, saved history; later DJ award added 25 for a final tested balance of 45 with four permanent stamps. Concept merch and community feature ideas are linked. No live offer/order/giveaway is implied.
- Final source and assets synchronized to delivery. Both local preview ports serve the same HTML. Front-end remains one index.html under 2 MB; optional Cloudflare tooling is separate.

## DJ entry and Bumpboxx shopping — October 26, 2026

DJ Booth entry points now enter the 3D room first. Select either physical turntable or the Select turntables HTML control to open the mixer. Dock and release-room DJ links follow the same room-first flow; no-WebGL fallback offers an explicit turntable-selection button. Gray Bumpboxx info modal and its gray wall photo were removed. Every modeled Bumpboxx opens the dedicated #shop/bumpboxx merchandise page with display selection, product imagery, apparel link and return-to-DJ navigation. Shop Bumpboxx links to the verified official catalog (Flare collection or all products); current stock/colors and payment are handled there, not by a fake local checkout. Sources: https://bumpboxx.com/collections/flare-8 and https://bumpboxx.com/collections/all . Browser checked room entry, explicit mixer selection, merch route/product selection and return. Cache-busted preview URL uses ?v=dj-room-20261026c .

13. **Complete — Site companion prototype.** Approved black-tee/red-hoodie artwork with diamond jewelry, draggable saved position, occasional sparkle and promotional poses, real catalog projects, site links, local chat and optional Workers AI endpoint. Follow-up refinement: replace labeled status card with compact hover-expanding chat/voice/store bar; bottom chat composer; smaller shaded thought cloud directly above character; light leg/head canvas motion. User rejected the procedural 3D redesign: original illustration restored. Production AI binding and microphone/browser validation remain integration tasks, not live services. See COMPANION.md.

## Latest companion correction — home chamber / intact poses

User requested a dedicated home chamber between the headline and ABN stamp at startup. Implemented companion-home in the hero; drag detaches into a fixed overlay, reload resets to home. Earlier saved positions are no longer restored. Procedural character remains removed. All segmented head/leg cuts are removed because they split wrists and legs; render whole approved poses during dragging/typing. User explicitly prefers no leg movement to seams. Keep bottom chat and compact icon bar at the feet, small shaded thought cloud. Browser checked home placement, drag to fixed positioning, reload to absolute home positioning. Repo and delivery synchronized. Latest preview ?v=companion-home-20261026f.

14. **Complete — Companion doorway and room travel.** Opening door/arrival, closing/disappearing doorway, brass return marker with destination choices and drag return, in-room arrival from actual room doorways, return upstairs. Approved art retained; no limb splitting. Portal/DJ arrival/return browser-checked.
15. **Complete — In-room movie theater.** Projector POV, existing-chair seating, rear-view popcorn poses driven by YouTube state, dimming lights, in-room film strip above the screen, room-wide fullscreen, Strapped Up music video, end-of-video turn-back suggestion. Actual Strapped Up playback and carousel checked. Latest theater redesign is browser-verified: clean Hit playback, no city/legacy overlays, centered chair placement, auto-hiding film strip, switching, keyboard dismissal and fullscreen exits. See THEATER.md for the precise validation boundary. No additional job started.

16. **Complete — Theater cleanup from October 26 screenshot.** Removed legacy 3D titles and video buttons, isolated theater rendering from the Houston world, centered all popcorn poses in the upholstered chair, moved selection to an auto-hiding film strip above the screen, simplified playback chrome. Browser screenshot saved; source/tests/type/assets/schema checks pass. Both local copies synchronized.

Latest theater sightline refinement: Screen increased from 7.8 × 4.3875 to 9 × 5.0625 (16:9), raised to y=4.05. Projector eye raised to y=4.15 looking toward y=3.65; companion remains in the same chair, clearly below the picture. Frame and rear-wall opening match the new screen; iframe projection derives dimensions from screen geometry to avoid mismatches. Browser verified actual Hit playback with clear head clearance. Latest preview ?v=theater-projector-20261026a.

17. **Complete — Larger, raised theater screen and projector sightline.** Screen9x5.0625 at y4.05; camera eye4.15. Actual Hit playback checked with clear space over the seated companion.
18. **Rejected — Separate 3D companion experiment.** Owner rejected the primitive/curved-texture study. Approved illustration remains in index.html; do not integrate that experiment.
19. **Complete — Member platform configuration and full build spec (design/research/foundation scope).** Thorough current vendor/music-provider research; Cloudflare-first recommendation and operating-cost scenarios; account dashboard/membership/library/settings pages alongside Stamp Book/rewards; versioned policy, internal rule evaluator and additive SQL safeguards; documented bulk ingest and complete staged launch plan. Real identity/billing/media/rewards activation remains explicitly pending. See BUILD-SPEC.md for current source of truth and completion gates. Browser checks passed for account routes, membership preview, Stamp Book, settings save and library empty state; phone layout has no horizontal overflow. Eighteen tests, source/type/asset/size checks and both SQL migrations pass. Source and delivery synchronized. No real account/payment/media activation.

20. **Complete at local prototype scope — Newspaper newsroom, current events, acquired photo gallery and persistent team CMS.** All requested content editors including merch are implemented. Browser-verified merch publish on source and mirrored delivery; gallery opening; newsroom front page. 150 news records/106 published briefs,113 photos,138 draft project references,7 merch items. Local MP3/image uploads and private/public access checks tested. Production auth/D1/R2/commerce remain next implementation phase, explicitly locked. See docs/CMS-GUIDE.md.
21. **Prepared; account connection required — Truthston.com GitHub repository import.** Remote verified as traeabnwebsite-cmd/Truthston.com; initial README/main history fetched and preserved. Local code/assets/check workflows prepared and committed after validation. Current CLI GitHub account lacks write permission. Owner must add Trae account; existing accounts remain connected. Do not claim a remote push completed.
22. **Prepared; follows repository push — New Trae Cloudflare deployment.** New account authorization not configured locally. Existing environment token targets another account; left intact. Prepared per-repository GitHub Actions deployment with scoped Trae secrets avoids replacing old credentials. No paid upgrade, resource creation or public deployment performed. Step-by-step additive connection guide: docs/CONNECT-ACCOUNTS.md.

Hosting completion update — October27: Jobs21–22 completed at deployed-preview scope. Trae GitHub CLI and repository-limited Cloudflare GitHub App authorized with owner confirmation. Code pushed; main automatically builds/tests/deploys via Cloudflare Workers Builds. Custom domain configured at owner-authorized IONOS account; nameserver success confirmed; Cloudflare zone Active and Universal SSL Active; www site browser-verified. Root local upstream DNS cache still temporarily points to old IONOS addresses. Existing accounts/mail settings preserved. See docs/DEPLOYMENT-STATUS.md. Paid memberships/cloud CMS/private media remain separate production implementation gates.

23. **Complete — Mobile spacing, site-wide readability and companion put-away.** Compact phone header/hero; touch-size navigation/controls; responsive account/editorial/merch/mixer layouts; player safe-area spacing. Station instructions moved into their own region below the room, with controlled fullscreen reparenting. Desktop enlarged again after owner feedback: body/copy16px, controls14px, secondary labels13px; newsroom feature copy18px. Added persistent companion dismissal that never travels into the record shop, plus explicit restoration. Browser checked 320/390/768/1280 widths and key page/room flows; existing automated checks pass. Original companion artwork retained.

24. **Complete — Larger authentic ABN approval stamp.** Replaced the striped homepage seal with an inline SVG rubber-stamp impression: curved Angel By Nature/Houston Texas lettering, clean ABN Approved type, concentric rings and tiny scattered ink flecks. 200px desktop size (previously118px),174px at tablet widths. Removed stripe masks/backgrounds from Stamp Book impressions too. Stamp Book button behavior browser-verified.
