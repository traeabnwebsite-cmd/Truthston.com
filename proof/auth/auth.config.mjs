// Schema-generation fixture. This is not imported by the public Worker.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
export const auth = betterAuth({
  baseURL: "http://localhost:8789",
  secret: "local-proof-only-not-a-production-secret-000000",
  database: drizzleAdapter(drizzle({}), { provider: "sqlite" }),
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  emailVerification: { sendOnSignUp: true },
});
