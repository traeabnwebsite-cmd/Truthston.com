# Newsroom copy and framing audit

Completed October 27, 2026 on `codex/modularize-frontend`.

## Published edition

26 original ABN Journal reports replace the thin imported research entries. Each report has at least three paragraphs and 100 words, a date and a credited source link. The lead and archive show the complete on-site report; the three wire previews show two paragraphs and link to the complete report. These are original desk reports based on the research vault and credited reporting, not copied full publisher articles.

80 formerly published research references are retained as private CMS drafts until developed into complete articles. The 44 pre-existing private article records were preserved. Local CMS history retains the previous state. The reviewed edition is recorded in `assets/content/newsroom-edition.json`; `scripts/apply-newsroom-edition.py` applies it once through the local CMS store and preserves later edits on repeat invocation. The article editor supports the News desk report kind.

## Layout

The lead uses a full-frame photograph alongside the complete story on desktop and stacks on phones. Dispatches flow beneath it. Archive columns flow with the actual copy instead of equal-height boxes. Full story pages also show the complete photograph. No CSS landscape crop is imposed on the newsroom images; full-resolution sources replace pre-cropped thumbnail sources. Gallery curation and its 66 unique photographs are unchanged.

## Verification

Browser: 1440px desktop and 390px phone; complete lead image, article opening, all 22 paginated archive cards, all 17 newsroom images loaded at their natural aspect ratio, no horizontal phone overflow, 18px lead body. Evidence: `handoff/refactor/newsroom-audit.json` and newsroom screenshots. Fixed player controls can appear over screenshots of long elements; they remain pinned UI, not part of article copy.

`npm run check`: 54 Node and 19 Python tests, TypeScript, schema, source and module-boundary checks pass. Newsroom checks cover substantial published copy, source attribution, full image availability, all paragraphs and HTML escaping. Deployment asset packaging and packaged source checks pass.

Preview: http://localhost:8765/?v=newsroom-complete#newsroom . Protected main/delivery/live are unchanged; this task does not promote the refactor.
