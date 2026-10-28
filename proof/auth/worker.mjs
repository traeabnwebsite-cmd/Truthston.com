import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema.ts";
// Integration fixture, never mounted by cloudflare/worker.mjs or public assets.
// Mail is captured only in this local test database; no messages are sent.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (
      env.PROOF_MODE !== "local-only" ||
      !["localhost", "127.0.0.1"].includes(url.hostname)
    )
      return new Response("Local compatibility fixture only", { status: 404 });
    const origin = url.origin;
    const auth = betterAuth({
      baseURL: origin,
      secret: "local-proof-only-not-a-production-secret-000000",
      database: drizzleAdapter(drizzle(env.AUTH_DB), {
        provider: "sqlite",
        schema,
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url }) => {
          await env.AUTH_DB.prepare(
            "INSERT INTO proof_mailbox(email,verification_url) VALUES(?,?)",
          )
            .bind(user.email, url)
            .run();
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
          await env.AUTH_DB.prepare(
            "INSERT INTO proof_mailbox(email,verification_url) VALUES(?,?)",
          )
            .bind(user.email, url)
            .run();
        },
      },
    });
    if (url.pathname === "/proof/mailbox") {
      if (request.method !== "GET")
        return new Response("Method not allowed", { status: 405 });
      const rows = await env.AUTH_DB.prepare(
        "SELECT email, verification_url FROM proof_mailbox",
      ).all();
      return Response.json(rows.results, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    if (url.pathname.startsWith("/api/auth/")) return auth.handler(request);
    return Response.json({ fixture: "better-auth-d1", localOnly: true });
  },
};
