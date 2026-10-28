import assert from "node:assert/strict";
const base = process.env.TRUTHSTON_AUTH_PROOF_URL || "http://localhost:8789";
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Proof runs only against local fixtures",
);
const req = (path, body, cookie) =>
  fetch(base + path, {
    redirect: "manual",
    headers: {
      Origin: base,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
  });
const runId = Date.now();
const users = [`one-${runId}@example.test`, `two-${runId}@example.test`],
  password = "LocalFixtureOnly-RecordShop-47";
const results = [],
  sessions = [];
for (const email of users) {
  let response = await req("/api/auth/sign-up/email", {
    email,
    password,
    name: "Compatibility Test",
  });
  assert.equal(response.status, 200, "Sign up");
  response = await req("/api/auth/sign-in/email", { email, password });
  assert.equal(response.status, 403, "Unverified identity must not sign in");
  const mailbox = await (await req("/proof/mailbox")).json();
  const message = mailbox.find((v) => v.email === email);
  assert.ok(message, "Local verification captured");
  const verification = await fetch(message.verification_url, {
    redirect: "manual",
  });
  assert.ok([200, 302].includes(verification.status), "Verify email");
  response = await req("/api/auth/sign-in/email", { email, password });
  assert.equal(response.status, 200, "Verified sign in");
  const cookies = response.headers
    .getSetCookie()
    .map((v) => v.split(";")[0])
    .join("; ");
  assert.ok(cookies, "Session cookie");
  const identity = await (
    await req("/api/auth/get-session", null, cookies)
  ).json();
  assert.equal(identity.user.email, email);
  assert.equal(identity.user.emailVerified, true);
  sessions.push({ cookie: cookies, id: identity.user.id });
  results.push({
    signup: true,
    unverifiedDenied: true,
    verified: true,
    session: true,
  });
}
assert.notEqual(sessions[0].id, sessions[1].id, "Separate identities");
const forged = await (
  await req("/api/auth/get-session", null, "better-auth.session_token=forged")
).json();
assert.equal(forged, null);
const logout = await req("/api/auth/sign-out", {}, sessions[0].cookie);
assert.equal(logout.status, 200);
assert.equal(
  await (await req("/api/auth/get-session", null, sessions[0].cookie)).json(),
  null,
);
assert.equal(
  (await (await req("/api/auth/get-session", null, sessions[1].cookie)).json())
    .user.id,
  sessions[1].id,
  "Other member remains signed in",
);
const denied = await req("/api/auth/sign-in/email", {
  email: users[1],
  password: "wrong",
});
assert.equal(denied.status, 401);
const resetRequest = await req("/api/auth/request-password-reset", {
  email: users[1],
  redirectTo: base + "/reset-complete",
});
assert.equal(resetRequest.status, 200);
const letters = await (await req("/proof/mailbox")).json();
const resetLetter = letters.filter((v) => v.email === users[1]).at(-1);
const redirect = await fetch(resetLetter.verification_url, {
  redirect: "manual",
});
const target = new URL(redirect.headers.get("location"), base);
const token = target.searchParams.get("token");
assert.ok(token, "Recovery token");
const newPassword = "ReplacementFixtureOnly-ABN-79";
const reset = await req("/api/auth/reset-password", { token, newPassword });
assert.equal(reset.status, 200);
assert.equal(
  await (await req("/api/auth/get-session", null, sessions[1].cookie)).json(),
  null,
  "Recovery revokes prior sessions",
);
assert.equal(
  (await req("/api/auth/sign-in/email", { email: users[1], password })).status,
  401,
  "Previous password rejected",
);
assert.equal(
  (
    await req("/api/auth/sign-in/email", {
      email: users[1],
      password: newPassword,
    })
  ).status,
  200,
  "New password works",
);
assert.equal(
  (
    await req("/api/auth/reset-password", {
      token,
      newPassword: "AnotherFixtureOnly-91",
    })
  ).status,
  400,
  "Recovery token cannot replay",
);
const crossOrigin = await fetch(base + "/api/auth/sign-in/email", {
  method: "POST",
  headers: {
    Origin: "https://untrusted.example",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email: users[1], password: newPassword }),
});
assert.equal(
  crossOrigin.status,
  403,
  "Cross-origin credential action rejected",
);
console.log(
  JSON.stringify(
    {
      fixture: "Better Auth1.7.14 + Drizzle0.45.4 + local Workers/D1",
      users: results,
      separateIdentities: true,
      forgedCookieDenied: true,
      logoutRevokes: true,
      otherSessionRetained: true,
      wrongPasswordDenied: true,
      recovery: true,
      recoveryRevokes: true,
      recoveryReplayDenied: true,
      crossOriginDenied: true,
      realEmailSent: false,
      productionEnabled: false,
      result: "pass",
    },
    null,
    2,
  ),
);
