# Truthston social sharing image and companion favicon

Created October 27, 2026 with the built-in imagegen tool. Isolated asset work on `codex/modularize-frontend`; no HTML, package or application source was edited by the image agent. Parent integrates metadata and decides deployment separately from refactor promotion.

## Selected sharing card

`assets/share/truthston-social-preview-companion-diamond-grill.png` — 1730 × 909, PNG, approximately 2.5 MB. Wide ~1.903:1 composition for Open Graph/text-message link cards. Exact primary domain, artist line and tagline were visually checked. The approved front-facing black-tee companion is inserted at right with his backward cap, beard, diamond ABN chain and jewelry, open smile with visibly silver diamond-pavé grill and a restrained jewelry glint. Cream paper, black ink, brick red, amber record label and deep-green Houston skyline match the site. Worn ABN APPROVED thumbs-up seal retained. Original non-companion variant is preserved at `assets/share/truthston-social-preview.png` (1730 × 909), but the diamond-grill companion version is selected per the owner’s latest instruction. Earlier closed-mouth and first-smile variants remain separate source artifacts and are not needed in runtime metadata.

Recommended metadata:

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="Truthston.com">
<meta property="og:title" content="Truthston.com | Trae Tha Truth">
<meta property="og:description" content="Tha Truth & Nothing but Tha Truth. Step inside the record shop, explore Houston, and build your Stamp Book.">
<meta property="og:url" content="https://www.truthston.com/">
<meta property="og:image" content="https://www.truthston.com/assets/share/truthston-social-preview-companion-diamond-grill.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1730">
<meta property="og:image:height" content="909">
<meta property="og:image:alt" content="Truthston.com worn mixtape artwork with Houston skyline, a vinyl record, ABN Approved stamp and the approved Trae site companion.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Truthston.com | Trae Tha Truth">
<meta name="twitter:description" content="Tha Truth & Nothing but Tha Truth.">
<meta name="twitter:image" content="https://www.truthston.com/assets/share/truthston-social-preview-companion-diamond-grill.png">
<meta name="twitter:image:alt" content="Truthston.com worn mixtape artwork with Houston skyline, vinyl record, ABN Approved seal and the Trae site companion.">
```

Messaging services fetch metadata from the public HTML and cache their previews; client-dependent caching may delay an already-shared URL’s refreshed card. No claim of guaranteed appearance in every messaging client is made.

## Selected companion favicon — open mouth / diamond grill

- `assets/share/companion-favicon-diamond-grill.png`: 64 × 64 PNG, alpha transparency, ~7.5 KB.
- `assets/share/companion-apple-touch-icon-diamond-grill.png`: 180 × 180 PNG, alpha transparency, ~47 KB.
- `assets/share/companion-favicon-diamond-grill-master.png`: 1280 × 1280 transparent PNG, ~2 MB. Authoring master; not necessary for runtime metadata.

The approved front-facing top-left atlas pose was the edit reference. Imagegen extracted a head portrait with the backward cap, ears/diamond earrings and beard, then made the user-requested open-mouth smile with silver diamond-pavé grill using the final sharing card as a reference; no new character design was requested. Technical 64/180-pixel exports were resampled from that generated master with macOS sips, preserving alpha. The actual 64-pixel export was visually inspected.

```html
<link rel="icon" type="image/png" sizes="64x64" href="/assets/share/companion-favicon-diamond-grill.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/share/companion-apple-touch-icon-diamond-grill.png">
```

No ICO was needed for the requested modern desktop/mobile browser prototype. Existing favicon metadata, if any, should be replaced consistently rather than adding conflicting icon declarations.

## Prompt record

Initial generation prompt: premium 1200×630/aspect~1.91:1 original social preview, large exact TRUTHSTON.COM, TRAE THA TRUTH artist line, exact “Tha Truth & Nothing but Tha Truth” tagline, worn cream/black/brick-red/amber/deep-green mixtape paper, oversized vinyl, Houston skyline, intricate ABN APPROVED seal with thumbs-up, safe margins, no faces/other artists/logos/watermarks. Tool produced the valid wide 1730×909 original.

Companion insertion edit: preserve that completed card and all exact typography; use the approved `assets/companion/trae-companion-atlas.png` top-left black-tee front-facing pose as the precise character reference; insert one full-body cutout at far right over the vinyl; preserve likeness/jewelry/proportions; move seal slightly left/down only to avoid overlap. Do not add other poses or new words.

Favicon edit: use the same approved atlas’s top-left pose; tight square head/cap/ears/beard crop, exact likeness/expression, genuine transparent background, no new badge/text or other cells, clear silhouette margins. This produced the 1280-pixel master, followed by technical size exports.

Original imagegen outputs remain under `/Users/brandonhughes/.codex/generated_images/01a17d6c-40f7-7f91-92ef-d5ed0abd62ba/`; project assets were copied into the worktree before delivery.

Final localized repair prompt: the first smile still read as natural white teeth, so change only visible tooth surfaces to unmistakable platinum/silver dental caps paved in tiny faceted diamonds, with dark setting lines/cool gray reflections. Explicitly avoid smooth white enamel, preserve open smile/face/layout/type and the existing single pendant glint. The final diamond-grill filename is the selected asset.

## Authoritative final assets / superseded variants

The only selected runtime artwork is `truthston-social-preview-companion-diamond-grill.png`, `companion-favicon-diamond-grill.png` and `companion-apple-touch-icon-diamond-grill.png`. All no-companion, closed-mouth, ordinary-teeth and prior favicon variants are superseded authoring history and may be archived outside public assets. The final favicon edit explicitly used the approved head master plus final OG reference, opened the mouth and covered both visible tooth rows with silver/platinum pavé diamond caps, maintaining transparent background and the approved character. The actual64px export was visually checked and the open bright grill remains visible. Parent handles deployment; image agent does not modify shared application code.
