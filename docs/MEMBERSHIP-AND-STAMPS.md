# Membership and Stamp Book implementation contract

October 26, 2026. Companion to BUILD-SPEC.md. The website is still a device-local preview. No server rewards API, real sign-in or paid entitlement has been activated.

## Terminology and storage

- **Stamp:** a permanent collectible with issuer, rule/version, award date and project/campaign identity. It is not spent.
- **Stamp Credit:** an integer program unit in an append-only ledger. Redemption spends credits; it does not remove a stamp. No cash conversion, transfers or announced monetary exchange rate.
- **Official award:** approval by a specifically scoped, active ABN/affiliate identity. Neither membership nor activity totals imply personal approval.
- **Member account:** a verified identity managed by the selected authentication service. Current browser display names are not verified identities.

Authoritative public configuration: `assets/config/membership-policy.json`. Internal evaluator: `cloudflare/membership-policy.mjs`. Initial application schema: migrations 0001 and 0002. The browser reads the config and retains an embedded fallback. Local activity deliberately uses simpler preview rules; the Stamp Book exposes planned production qualifications separately.

Display-to-canonical ID mapping: abn → abn-approved; truth → the-truth; maab → guerilla-maab; street → street-certified; crate → crate-digger; chop → chopped-in. The project-collector entry is an earning template; actual awards are `project:<stable project ID>`. Importing a new eligible project must create its own stamp definition before awarding it. It has no automatic credit value.

## Evidence flow

1. Authenticate a secure session; load own active member and verified-email status.
2. Issue a server session/nonce for the activity and validate access to the relevant track/project/campaign.
3. Receive small, bounded client signals. Rate-limit, check origin/CSRF, nonce, resource, sequence and server elapsed time. Claims such as `verified`, `credits`, `actorRoles`, `memberId` or `balance` in a request have no authority.
4. Create server-owned evidence receipts. Playback uses at-most-15-second qualifying increments, excludes seeks/duplicate sequences and stops accruing this milestone after qualification. Dwell timers require valid resource sessions. DJ receipts exclude auto-chop and disabled playback. Client visibility and audible state are additional signals, not proof of attention.
5. The domain evaluator consumes only validated/DB receipts, looks up the configured amount and produces an award intent. It is an internal helper, not an HTTP input validator or an anti-fraud system.
6. Insert the award with a stable member/stamp/version event key. SQL uniqueness and the credit-after-insert trigger make the award and fixed credit atomic. On duplicate conflict, fetch and return the existing award as an idempotent success. Do not rerun a credit insert.
7. Notify/refresh the book after commit. Persist only minimal long-term milestone/issuer evidence; expire short-lived receipt details under the retention policy.

Rules and current proposed amounts: The Truth 60 qualifying seconds / 40; Crate Digger five distinct releases at eight seconds / 50; Street Certified four landmarks at five seconds / 30; Chopped In four manual authorized cuts / 25. Each is once per member. Official awards and project collectibles start at zero credits. Future repeatable campaigns may use a 100-credit daily cap under a separate atomic campaign budget, using America/Chicago calendar days. No repeatable campaign service exists yet; the cap is configuration for that future phase, not a claim that it is enforced today.

Fraud or mistaken awards are annotated by a revocation record, not deleted. Any credit correction is a separately authorized ledger event. If fraudulent credits have already been spent, suspend redemption and send the case to support; do not weaken the no-overdraft invariant to force an unexplained negative balance. Future adjustments and returns need a documented audited workflow.

## Official approvals

`member_roles` is writable only by restricted staff administration. ABN approval requires `abn_approver`; Guerilla Maab requires `maab_approver`. Admin or paid-member status alone is not enough. Generate an `official_approvals` record with actor, target, reason and timestamp, then insert the stamp. Migration 0002 rejects the wrong scope and an official award with no approval record. The application must additionally require fresh staff authentication, audit the grant and apply issuer-display/privacy policy.

Role bootstrapping is not a public endpoint. Membership/profile settings never accept role names from a customer. Past legitimate official awards survive ordinary subscription cancellation. A subsequently revoked staff role prevents new grants; historical issuance remains auditable.

## Atomic redemption

Use a server-owned reward ID, stable member-scoped idempotency key and cost from the database. In one D1 atomic batch:

1. Insert the exact debit into credit_ledger; the overdraft trigger rejects insufficient funds.
2. Insert a `reserved` redemption referencing that debit. The guard requires active member/reward, matching configured price, matching member/debit and available stock. The stock trigger reserves one item.
3. Add the fulfillment/outbox work in the same transaction when the commerce integration is implemented.

If step 2/3 fails, the whole transaction must roll back step 1. Never split this across independent run() calls. A replay must return the same existing record, not a new debit. When a reserved redemption is cancelled, the SQL transition creates one compensating credit and restores stock once. A fulfilled item cannot be silently cancelled through that same transition. Merchant returns/refunds need their own explicit workflow.

No real rewards are seeded active. The local UI can demonstrate a redemption using its own preview ledger; that state is never accepted by the server. The configured sample tee, merch credit and drop are product-design examples, not funded offers.

## Membership state and entitlements

Free member is the default after real verification. The proposed Vault plan has no approved price ID and remains inactive. Stripe customer/subscription IDs are server-linked to a member, never selected by the browser. Verified webhooks reconcile the current provider state and update expiring entitlements. Purchased assets are independent from subscription inclusion. Billing success URLs, display names and local storage grant no access.

Before activation decide included/downloadable/DJ-eligible assets, month/year prices, cancellation/failure/grace/refund treatment, countries and taxes. Staff roles, public-book consent and marketing consent are independent attributes. Deleting a personal account requires session revocation and privacy-aware anonymization/retention decisions for ledger/order/audit records.

## Pages and current preview behavior

- `#account/overview`: passport, totals, next milestone and recent credit events.
- `#account/stamp-book`: collectible impressions, progress, requirements and official/once-only labels.
- `#account/membership`: The Family/free and ABN Vault/coming soon; benefit preview, no charge.
- `#account/library`: recently browsed sleeves and saved favorites. Owned/included/downloads remain empty until real access exists.
- `#account/rewards`: sample rewards and local ledger, no fulfillment.
- `#account/community`: clearly proposed community interactions.
- `#account/settings`: local display name/preferences; sign-in/devices/billing not connected. No email collected/sent or public book published.

Routes survive direct navigation/reload and browser Back. The legacy daily crate counter is labeled Hunts Completed, separate from collectible stamp totals and spendable credits. No repeatable credit campaign is active. Local prototype balances persist only in that browser. Preserve this honesty when integrating actual APIs.

## Verification contract

Automated domain tests reject unverified members, duplicated/oversized/listener-mismatched/seek receipts, short/repeated dwell events, automatic DJ cuts, wrong issuer roles and invalid project scope. Timezone tests cover Houston midnight and winter offset. SQLite migration tests verify automatic award credit, duplicate award rejection, immutable credits/stamp history, scoped approval, out-of-stock rollback, one-time cancellation credit and audit immutability. These tests do not replace deployed D1 race/load tests or production auth/security review.

Required staging tests before real rewards: parallel last-item redemptions; parallel overdraft attempts; duplicate award/webhook/request retries; official role revocation; interrupted fulfillment; account suspension; cross-member ID tampering; csrf/replay/rate abuse; receipt retention; and reconciliation against provider orders. Nothing in a static page is a secure reward service on its own.
