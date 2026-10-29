# Cloud foundation checkpoint — October28,2026

## Provisioned and verified

Trae Cloudflare account90e7a4da02e47f49eb819dd595f1f430 was opened through its existing GitHub sign-in. Created D1 database **truthston-staging**, ID **b47e7d2f-e2e0-46af-aea3-3edb0af94ed2**. Dashboard verifies its identity and0 application tables. `wrangler.staging.jsonc` now records a staging-only DB binding. Production config has no database binding. No remote migrations, member records, paid plan upgrade or role grants were performed. Local proof migrations do not constitute a migrated cloud database.

Dashboard: https://dash.cloudflare.com/90e7a4da02e47f49eb819dd595f1f430/workers/d1/databases/b47e7d2f-e2e0-46af-aea3-3edb0af94ed2/metrics

## Identity compatibility

`npm run proof:auth` passes actual local workerd/D1 signup, verification, two independent sessions, cookie forgery/wrong-password denial, logout, recovery/replay/session revocation and cross-origin denial. See `proof/auth/README.md` and `handoff/refactor/auth-compatibility-proof.json`. Generated schema/migrations are separate from application SQL. Public identity remains disabled. Still required: cloud schema rollout, member/profile linkage, transactional fault handling/compensation, real verified email, staff authorization and recovery/backup rehearsal.

## Concrete external gates

1. **GitHub restored:** Completed its email verification through the signed-in Trae Gmail inbox. Existing CLI account access works again; other saved accounts remain. Commits51a48fa and62ac43f were pushed to main. GitHub and Cloudflare checks for62ac43f pass. Static code release is3e613593458bee8fefe1; public auth remains deliberately unconfigured.
2. **R2 billing details required:** Owner explicitly approved Standard R2 subscription and its displayed renewal/usage terms. Clicked the approved enrollment action. Cloudflare now requires card/billing details and has no payment method filled in. User was asked to enter those directly in the secure Cloudflare form, not chat. No card/addresses invented or copied from another account. Activation/buckets remain pending that input. The checkout tab is preserved.
3. **Transactional mail and commercial setup:** verified sender/provider, actual subscription plans/price IDs, fulfillment integration and selected authorized masters remain production inputs. Do not fabricate them, publish draft audio or import local preview balances.

Continue independent local work within the completion spec while these gates remain pending; never claim C03/C04 production acceptance or deploy using the unrelated WebFaktory token. The current public frontend release is3e613593458bee8fefe1 and the verified deployed source is62ac43f. Recheck after any subsequent successful push.
