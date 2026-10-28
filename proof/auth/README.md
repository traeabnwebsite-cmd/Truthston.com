# Local identity compatibility proof

October28,2026. Better Auth1.7.14, @better-auth/drizzle-adapter1.7.14, Drizzle ORM0.45.4; schema generated with auth1.7.14; migration generated with drizzle-kit0.31.11. Uses the existing pinned Wrangler/workerd and compatibility date2026-10-25. This is an isolated integration fixture, not the public account service.

Run `npm run proof:auth`. The runner creates a temporary local D1 state folder, applies the generated auth migration plus a local mailbox sink, starts workerd on an available loopback port, exercises the actual HTTP auth handler, then stops the process and removes the temporary state. Cloudflare account credentials are removed from this child environment. No remote database command, real email or production endpoint is used. Output contains only pass states, never passwords/cookies/verification URLs.

Verified: two separate signups; email verification required; local verification; independent cookie sessions; forged cookie and wrong-password denial; logout revocation while preserving the other user's session; recovery, prior-password denial, recovery-token replay denial and session revocation; cross-origin credential-action denial. The fixture mailbox intentionally captures verification and recovery URLs in its local test database. Keep it out of every public deployment. Worker checks localhost plus fixture mode, has no public routes and is not imported by the production Worker.

Generated `schema.ts` and `migrations/0000_short_miracleman.sql` belong to identity, separate from application migrations0001/0002. Regenerate using:

```
npx --yes --package auth@1.7.14 auth generate --config proof/auth/auth.config.mjs --output proof/auth/schema.ts --yes
npx drizzle-kit generate --config proof/auth/drizzle.config.mjs
```

The first schema-generation fixture can report missing database tables before emitting the schema; the actual request proof uses the generated schema after migrations are applied. The local mailbox migration is a fixture only and must not become a production mail delivery design. Hardcoded local fixture material is not a production secret; production requires a separate managed secret and verified email provider.

This establishes basic package/runtime compatibility. It does not establish cloud D1 recovery, transactional fault behavior, production email delivery, staff role authorization, member/application linkage, privacy controls, rate limiting, account pages, billing or entitlement access. In particular, D1 does not support the ORM's ordinary interactive transactions; failure injection/compensation around multi-write identity changes remains an explicit production gate. Never turn on the public account capability based on these happy-path checks alone.

Sources reviewed: [Better Auth Drizzle adapter](https://better-auth.com/docs/adapters/drizzle), [email/password and recovery](https://better-auth.com/docs/authentication/email-password), [Drizzle D1 setup](https://orm.drizzle.team/docs/get-started/d1-new), [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/).
