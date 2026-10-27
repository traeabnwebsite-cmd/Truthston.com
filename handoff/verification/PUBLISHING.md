# Publishing verification — October 27, 2026

- Browser: source CMS published an ABN Everyday Tee description; delivery preview at8766 showed the exact update. Persisted record version2 and audit revision2.
- Browser: newsroom front page, acquired-photo gallery with24 initially loaded thumbnails and zero broken loaded images, full-size image lightbox, current/past event separation and no invented future event.
- Browser console: no captured errors on editorial pages.
- Tests: nineteen Node tests (membership evidence/awards, Worker boundaries, theater), seventeen Python store/HTTP tests (including store checks under HTTP setup), TypeScript, HTML syntax/local paths/2MB size, SQL invariants/policy consistency.
- Dry deployment: Wrangler assembled Worker and542 public assets successfully; no deployment performed. MP3 files, local uploads/drafts/history/secrets excluded.
- Saved screenshots: abn-journal.png and merch-cms.png.

Source and delivery servers run server.preview on127.0.0.1:8765/8766 and share canonical CMS state. The standalone launcher starts another available loopback port. Cloudflare CMS and membership/payment/project streaming remain fail-closed until implemented and configured.
