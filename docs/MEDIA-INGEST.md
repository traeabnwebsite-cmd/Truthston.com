# Bulk catalog intake and media delivery

October 26, 2026. Specification, not a deployed uploader. No media has been uploaded to a cloud account by this job.

## Owner workflow

The owner delivers one release folder, several folders, a ZIP, or access to an approved label-owned object store. Staff supplies a CSV/JSON manifest and the rights records. The importer creates one ingest job for the batch, lists every track, extracts tags where available and presents a review table. Staff resolves missing files, duplicate IDs, track order, titles/artwork, explicit labels, rights and stream/download/DJ flags before publishing. Successful files are retained when another track fails. A retry does not upload or publish the same rendition twice.

There must be one playable file/record per track, but the owner does not have to upload or type each one manually. Existing ISRCs can help reconcile recordings; do not merge distinct masters/versions just because they have the same title or loosely matching filename. Leave unknown ISRCs empty.

Approved import sources: selected local files/folders, an authenticated label-owned S3-compatible bucket, or a specifically allowlisted authorized origin with an agreed delivery contract. Apple Music, Spotify and Deezer catalog pages are reference links, not audio-import URLs. Never rip provider streams.

## Manifest shape

`docs/media-manifest.example.json` illustrates an unreviewed, unpublished batch. Replace unknown owners/agreements and file paths with real approved values. It intentionally does not authorize the included prototype song for commercial publication.

Each project needs ID/title/date/artwork and ordered track rows. Each track needs ID/title/order/path, optional ISRC, and master/composition approval plus allowed uses/territories/dates. The intake UI can prefill metadata from tags, but inferred values remain editable and clearly unverified. Store agreement documents in restricted storage and use references in catalog records.

## Processing design

1. Staff authentication/MFA and ingest permission, bounded file count/type/size and upload-job creation.
2. Multipart/resumable direct uploads with object prefix and expiry scoped to that job. Validate MIME signature, extension, real size and checksum after arrival; do not trust browser declarations.
3. Quarantine and background inspection. ZIP handling rejects absolute paths, `..` traversal, symlinks, excessive nesting/compression expansion and out-of-budget extraction. A ZIP is never executed.
4. Preserve lossless/original files in a private master bucket, with immutable version identifiers and independent backup.
5. Create streaming renditions, optional short preview, waveform and approved DJ beat-grid data through FFmpeg-capable batch/container compute. Ordinary edge request Workers coordinate jobs rather than decode large masters in memory. Job retries have stable keys and bounded attempts/dead-letter handling.
6. Reconcile track/project catalog IDs and rights. Reject publication for unknown/expired territory/use permissions. Prepare an eligible project ZIP only if downloads are authorized.
7. Staff review, publication audit entry and explicit release scheduling. Publish catalog metadata/artwork separately from private media keys. Old renditions remain versioned until retention policy allows cleanup.

Object keys use IDs/checksums, for example `masters/<projectId>/<trackId>/<sha256>.flac` and `audio/<trackId>/<version>/stream.mp3`; avoid sensitive metadata in keys. Different providers are represented by `provider` + `asset_id`, not hard-coded public URLs.

## User playback

The Worker validates current session, member state, rights window/territory and subscription/purchase inclusion. It then streams authorized R2 ranges or returns a short-lived playback authorization. Range/seek responses preserve appropriate 200/206/416, Content-Type, Content-Length, ETag, Content-Range and Accept-Ranges semantics. Private caching must not leak access between users. Tokens are not printed into logs and refresh requires rechecking access.

Independent members have independent playback cursors; many can play one stored object at once. The proposed one-active-session policy applies per member, not to the whole website. Two DJ decks share that member's playback lease. Video pauses local audio; a second device offers an explicit takeover. Load-test the actual bitrate and peak-session forecast.

A download stamp is awarded once per eligible project after the server has checked access and begins delivering authorized project bytes. Ticket creation or a client “complete” event is not proof of saved files. Never imply that an expiring token can recall a file the user already downloaded.

## Admin review states and reporting

States: draft → uploading → validating → processing → review → ready → published, with failed/retry states per track and an auditable job summary. Show track count, duplicate/missing files, rights status, rendition readiness, storage estimate and publish blockers. At launch the interface may be operator-assisted; a full self-service uploader is a subsequent backend deliverable.

Reports: playback availability and errors, catalog rights expirations, ingest failures, storage/rendition size, delivered video minutes, purchases/download authorizations and royalty usage according to agreements. Keep royalty accounting separate from rewards; a user's reward progress is not an authoritative royalty statement.

## Acceptance before enabling paid media

Import a multi-track test project in one batch; interrupt/resume uploads; retry one failure; detect duplicates; reject unsafe ZIPs and unreviewed rights; seek first/middle/end; reject expired/other-member tokens; disable an expired/revoked asset; demonstrate several members playing independently; exercise two same-record DJ decks; verify one-session takeover, privacy of private objects, backup restore and processing cost limits. No paid launch based solely on the current public Boss Ballin preview.
