# Truthston.com — Trae Tha Truth / ABN Records, CDs and Tapes

An interactive website for Houston legend Trae tha Truth.

A build-free interactive HTML pitch prototype with a Three.js Houston scene, real catalog artwork, supplied Boss Ballin preview, a two-deck DJ mixer, video room and merchandise preview.

## View locally

Double-click `Launch Preview.command` in `Documents/Trae Website`, or run:

```sh
python3 -m server.preview --port 8765
```

Open http://localhost:8765/. Keep the server running. Audio starts only after pressing Play. The HTML and local assets need no npm installation or compilation.

## Work tracking

Read `WORK-QUEUE.md` for the user-ordered jobs and `CLAUDE-HANDOFF.md` for continuation details. Copy source and assets to `Documents/Trae Website` after changes so both local previews match.

## Optional Cloudflare / GitHub integration

See `CLOUDFLARE-PLAN.md`. `npm ci`, `npm run check`, and `npm run dev:cloudflare` exercise the optional deployment shell. Deployment requires your own configured Cloudflare account. No account/payment system is live in this prototype.

Prepared deployment output contains index.html, cms.html and published assets. MP3 masters, drafts, local uploads and credentials are excluded. A fresh cloud preview uses the generated beat until authorized audio delivery is connected. The supplied Boss Ballin file remains available locally.

Account → Stamp Book includes device-local progress, activity stamps, demo credits/redemptions and proposed member interactions. These are previews, not live accounts or orders.

The draggable site companion uses the approved black-tee artwork, thought clouds, a hover action bar, bottom chat and browser-dependent voice. See COMPANION.md for controls and optional live AI activation.

The companion doorway and in-room cinema are documented in THEATER.md, including the exact browser verification boundary.

## Membership platform specification

Start with [BUILD-SPEC.md](BUILD-SPEC.md). Supporting research: [platform/services/music rights](docs/PLATFORM-RESEARCH.md), [member and stamp contract](docs/MEMBERSHIP-AND-STAMPS.md), [bulk media intake](docs/MEDIA-INGEST.md). Account design preview: `http://localhost:8765/?v=member-house-20261026a#account/overview` (delivery copy on8766). Rules/plans: `assets/config/membership-policy.json`. Both application migrations and the policy tests run through `npm run check`. Actual auth/payment/protected media endpoints remain unavailable until implemented/configured; this is not a live paid membership platform.

## Newsroom, gallery and merch CMS

- Newspaper: http://localhost:8765/#newsroom
- Events: http://localhost:8765/#events
- Acquired photo archive: http://localhost:8765/#gallery
- Merchandise: http://localhost:8765/#merch
- Team publishing console: http://localhost:8765/cms.html

Read [CMS-GUIDE.md](docs/CMS-GUIDE.md) for editing/uploading and the production boundary. Local edits save to disk and mirror to the delivery preview. Read [CONNECT-ACCOUNTS.md](docs/CONNECT-ACCOUNTS.md) for adding the Trae GitHub/Cloudflare accounts while preserving existing connections. The cloud CMS, subscriptions and checkout are not activated.

## Live preview and deployment

https://www.truthston.com/ — Cloudflare-hosted prototype. Alternate: https://trae-tha-truth-preview.traeabnwebsite.workers.dev/ . Main commits build/test/deploy automatically through Cloudflare Workers Builds. See [DEPLOYMENT-STATUS.md](docs/DEPLOYMENT-STATUS.md) for DNS, SSL, account connections and production boundaries.
