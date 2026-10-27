# Add the Trae accounts without removing existing accounts

Prepared October 27, 2026. No existing connection was disconnected. Repository: https://github.com/traeabnwebsite-cmd/Truthston.com (public, initial main branch preserved). The terminal’s active GitHub account has read-only access to this repository; the Cloudflare token targets the older WebFaktory account. Do not deploy using that old token.

## 1. Add GitHub to Codex

1. In Codex, open Plugins and the installed GitHub plugin’s settings/connections.
2. Choose **Connect another account** / **Add account**, if shown. Do not choose Disconnect or uninstall.
3. In the browser, sign in as `traeabnwebsite-cmd`. Review the requested access yourself and select `Truthston.com` where repository selection is offered. Complete the authorization.
4. Return here and say “Trae GitHub connected.” We will verify the selected account and repository write permission before pushing.

Official OpenAI documentation confirms additional accounts can be added from a plugin’s settings page. Exact labels depend on the app. If an add-account control is absent, use the terminal option below; do not remove a working connection as a workaround.

https://developers.openai.com/plugins/build/auth/#support-multiple-accounts

## 2. Add the same GitHub account to the local Git client

In Terminal:

```sh
gh auth login --hostname github.com --git-protocol https --web
```

Complete the device authorization in Chrome **as traeabnwebsite-cmd**. Existing saved accounts remain. Then:

```sh
gh auth switch --hostname github.com --user traeabnwebsite-cmd
gh auth status
```

Tell Codex when authorization completes; the local commit can then be pushed. A browser being logged in does not automatically authenticate the terminal. Do not paste access tokens into chat. We will use the existing repository and preserve its initial README commit, not force-push over history.

GitHub CLI docs: https://cli.github.com/manual/gh_auth_login and https://cli.github.com/manual/gh_auth_switch

## 3. Connect the Trae Cloudflare account to this repository

The simplest isolated route is the prepared GitHub Actions deployment workflow:

1. Sign into the new Trae account at Cloudflare. Select that account; copy its Account ID from the dashboard.
2. Open profile → API Tokens → Create Token. Use the **Edit Cloudflare Workers** template and restrict Account Resources to the **Trae account only**. Review/approve the access yourself. Start with preview deployment permissions; add D1/R2 resource permissions only when configuring those services.
3. In Truthston.com → Settings → Secrets and variables → Actions, add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` with the new account’s values. Keep the token out of code, chat, screenshots and public files.
4. Tell Codex the repository secrets are saved. We will verify the account target and run the prepared **Deploy preview to Cloudflare** workflow, which runs validation and prepares public assets before Wrangler deployment.
5. Review the resulting workers.dev preview before attaching Truthston.com. Domain/DNS setup follows after the correct project deploys.

This project-scoped CI configuration does not replace existing local Cloudflare credentials or alter other projects. The existing terminal token remains untouched. Cloudflare’s Git integration is another option, but choose one deployment pipeline to avoid duplicate deployments.

Cloudflare instructions: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/

## 4. Production services after the preview

Cloudflare Workers + D1 + private R2, with real staff/member authentication, Stripe subscriptions/commerce and video delivery. Supabase is optional, not required by this architecture. The local CMS is finished at prototype scope; secure cloud CMS persistence, auth, commerce/fulfillment and paid media authorization are the next implementation phase. No paid account upgrades or billing terms have been accepted by this work.
