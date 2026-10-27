# Unique photo gallery

October27,2026 · Working branch only.

The cleared vault contains1157 original image assets, including694 release artwork files and331 video thumbnails. Its indexed photograph sources contain113 public photo records. These numbers are not a claim of1157 distinct photographs.

An exact-file hash and crop-aware perceptual audit, followed by visual contact-sheet review, selects66 distinct photographs.25 non-photo or unrelated entries (publisher logos/placeholders, covers, flyers, collages and an unrelated portrait) are excluded from the gallery. Repeated crops, resizes, rotations and near-identical event frames are grouped; a single preferred usable frame represents each family. All original files, CMS records and article image references remain intact.

assets/config/gallery-curation.json records image identities, preferred frames, exclusions and content hashes. Gallery filtering, pagination and lightbox all consume the same unique set. If a preferred record is unpublished, one available family member remains. New local CMS photo uploads receive a server-derived SHA-256 contentHash; identical uploads match each other and existing archive hashes instead of creating repeated gallery cards. This is not a cloud photo-processing service or an automatic visual-similarity classifier for future recompressed uploads; future staff photos still require curation.

Owner was asked whether separately labeled video stills should be added. Until that preference is answered, gallery remains photographs only. No video thumbnails are relabeled as photographs to inflate its count. Source photos remain in Documents/Trae Website/images; the contact sheet was a temporary analysis artifact, not public artwork. Pillow/ImageHash were installed only in an isolated temporary analysis environment and are not production dependencies.

Verification: all66 cards load across pagination with unique identities; lightbox next/close works; filters preserve the same uniqueness contract. Three direct module tests and one server-derived hash test added. Existing CMS/privacy/policy tests retained.
