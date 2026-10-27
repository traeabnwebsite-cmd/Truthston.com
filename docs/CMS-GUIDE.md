# ABN publishing desk — October 27, 2026

Open the local [team console](http://localhost:8765/cms.html). Double-click Launch Preview.command to start the website and CMS, or run `python3 -m server.preview --port 8765` from the project folder. Python 3.10+ required; no Python packages, front-end build or npm installation needed for local viewing/editing.

## What editors can do now

- Newsroom: create original articles or sourced briefs; title, summary, body, byline, dated source link, date precision, section, photo, featured status. Newspaper front page, article views and search consume published content.
- Current events: dates, location, description and event/ticket link. Finished events automatically appear in the archive, not as upcoming announcements.
- Photos: upload JPEG/PNG/WebP; alt text, caption, date, credit, collection and source. Public gallery supports filters, full-size viewing and keyboard navigation.
- Projects: upload cover art and multiple MP3s; set titles, BPM and track order; listening access and DJ-eligibility metadata. Existing 138 catalog references are drafts until real files are attached. Public projects can play through local server byte-range delivery. Member/purchase playback is locked until real identity/payment entitlements are implemented. The DJ booth currently remains the supplied Boss Ballin demo; DJ eligibility is saved metadata, not a finished catalog-to-mixer selector.
- Merch: create/edit products, artwork uploads or library image, descriptions, category, USD price, sizes/options, stock, coming-soon/available/sold-out state, featured status and checkout URL. Both the merch page and Flare/camo DJ-room Bumpboxx routes read the same products. The ABN red room display remains a concept and links to the official collection. Prices left empty show “to be announced.” Available items require a real checkout URL. Stock is informational; it does not reserve inventory or fulfill orders.
- Site copy: newsroom masthead/tagline, gallery/events introductions and record-shop introduction.
- Activity log: local editor actions, revision numbers and publication status. Previous state snapshots are retained privately for manual recovery.

## Publishing and storage

Save draft keeps content off public pages. Publish updates both configured local previews after browser refresh. Schedule uses the browser timezone converted to UTC; the local content API evaluates publication time on reads. The static JSON snapshot is regenerated on saves/startup; a production scheduling worker is still required.

Private state is `content/editorial.json`; uploads/history are `.local-media/`. Both are ignored by Git. `.cms-local.json` points source and delivery to one canonical store and mirrors published snapshots/images. Do not delete these folders when copying or deploying code. Back them up separately until R2/D1 are live.

The public website reads `/api/content`, falling back to `assets/content/site.json` for static hosting. That snapshot includes published content only, no drafts, local source paths or uploaded-file IDs. Publicly published images are deliberately copied to public assets. Changing an image back to draft removes the listing; it does not revoke an already distributed public image URL.

Local service binds only to 127.0.0.1. Host, same-origin, HttpOnly session and CSRF checks protect writes. It is a trusted-local team editor, not a production multi-user login. Do not expose it with a tunnel or bind it to a network interface.

## Production completion gate

The Cloudflare Worker serves the sanitized publication snapshot but rejects CMS and project-stream endpoints with 503. Implement staff identity/roles and server authorization; port persistence to D1, upload originals/private audio to private R2 with multipart integrity checks; add validated image/audio processing, scheduled publisher, backups and staff audit identity. Connect Stripe/commerce checkout and inventory/webhooks before taking real orders. Local publishing does not deploy automatically to Cloudflare. The public snapshot must be committed/deployed until the authenticated cloud publisher replaces it.

## Research import

Imported 148 vault news records plus two new distinct source records: 150 total, 106 published briefs and 44 drafts for review. Added short original briefs linked to checked Source/HOT 97/Defender reporting. Retained original publication dates and approximate-date precision. Imported 113 unique acquired photos with source/credit metadata. Photos include album artwork, portraits, press photos and community moments; source headline captions are archive labels, not newly asserted event descriptions.

The owner is Trae’s team and has explicitly cleared acquired photos and Trae intellectual property/partner agreements. Preserve credits and source links. Do not re-ask for blanket rights permission. Rights clearance does not turn consumer Apple/Spotify subscriptions into a site-hosting service; upload the authorized music files to private R2 for the paid platform.
