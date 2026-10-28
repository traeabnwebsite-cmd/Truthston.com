# Cloud foundation checkpoint — October28,2026

## Provisioned and verified

Trae Cloudflare account90e7a4da02e47f49eb819dd595f1f430 was opened through its existing GitHub sign-in. Created D1 database **truthston-staging**, ID **b47e7d2f-e2e0-46af-aea3-3edb0af94ed2**. Dashboard verifies its identity and0 application tables. `wrangler.staging.jsonc` now records a staging-only DB binding. Production config has no database binding. No remote migrations, member records, paid plan upgrade or role grants were performed. Local proof migrations do not constitute a migrated cloud database.

Dashboard: https://dash.cloudflare.com/90e7a4da02e47f49eb819dd595f1f430/workers/d1/databases/b47e7d2f-e2e0-46af-aea3-3edb0af94ed2/metrics

## Identity compatibility

`npm run proof:auth` passes actual local workerd/D1 signup, verification, two independent sessions, cookie forgery/wrong-password denial, logout, recovery/replay/session revocation and cross-origin denial. See `proof/auth/README.md` and `handoff/refactor/auth-compatibility-proof.json`. Generated schema/migrations are separate from application SQL. Public identity remains disabled. Still required: cloud schema rollout, member/profile linkage, transactional fault handling/compensation, real verified email, staff authorization and recovery/backup rehearsal.

## Concrete external gates

1. **GitHub CLI refresh:** existing credentials became invalid after the C02 publication. C03 is committed locally51a48fa but not pushed. Browser refresh reached GitHub’s “Confirm access” email verification under traeabnwebsite-cmd; user was asked to complete it. CLI polling ended on a network reset, so start a fresh same-scope login after verification if needed. Existing unrelated accounts must stay connected. Query checks using the exact intended SHA, never remote HEAD for an unpushed local commit.
2. **R2 enrollment:** the Trae account has not enrolled in R2. Cloudflare’s page requires accepting an automatically renewing usage-billed subscription, $0 now with free allowances and paid overages. Owner confirmation was requested with the exact rates shown. Do not click Add R2 subscription before that response. No bucket exists yet. The open R2 enrollment tab is retained for review. Evidence: `output/playwright/cloudflare-r2-approval.png`.
3. **Transactional mail and commercial setup:** verified sender/provider, actual subscription plans/price IDs, fulfillment integration and selected authorized masters remain production inputs. Do not fabricate them, publish draft audio or import local preview balances.

Continue independent local work within the completion spec while these gates remain pending; never claim C03/C04 production acceptance or deploy using the unrelated WebFaktory token. The current public frontend release remains416f9c35b249ec1f3a8c and the last verified deployed source isd779d14. Recheck after any subsequent successful push.
