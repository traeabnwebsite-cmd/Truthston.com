// Real local workerd/D1 compatibility test. No Cloudflare account credentials used.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
const root = resolve(import.meta.dirname, ".."),
  state = await mkdtemp(join(tmpdir(), "truthston-auth-proof-"));
const env = { ...process.env, WRANGLER_SEND_METRICS: "false" };
delete env.CLOUDFLARE_API_TOKEN;
delete env.CLOUDFLARE_ACCOUNT_ID;
const cli = resolve(root, "node_modules/wrangler/bin/wrangler.js"),
  config = "proof/auth/wrangler.jsonc";
const probe = createServer();
await new Promise((r) => probe.listen(0, "127.0.0.1", r));
const port = probe.address().port;
await new Promise((r) => probe.close(r));
let worker;
try {
  execFileSync(
    process.execPath,
    [
      cli,
      "d1",
      "migrations",
      "apply",
      "AUTH_DB",
      "--local",
      "--config",
      config,
      "--persist-to",
      state,
    ],
    { cwd: root, env, stdio: "pipe", timeout: 60000 },
  );
  worker = spawn(
    process.execPath,
    [
      cli,
      "dev",
      "--local",
      "--config",
      config,
      "--persist-to",
      state,
      "--port",
      String(port),
    ],
    { cwd: root, env, stdio: "ignore" },
  );
  let ready = false;
  for (let i = 0; i < 150; i++) {
    try {
      const r = await fetch("http://localhost:" + port, {
        signal: AbortSignal.timeout(400),
      });
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await delay(200);
  }
  if (!ready) throw Error("Local auth proof runtime did not start.");
  const result = execFileSync(process.execPath, ["proof/auth/verify.mjs"], {
    cwd: root,
    env: { ...env, TRUTHSTON_AUTH_PROOF_URL: "http://localhost:" + port },
    encoding: "utf8",
    timeout: 60000,
  });
  console.log(result.trim());
} finally {
  if (worker) {
    worker.kill("SIGTERM");
    await new Promise((resolve) => {
      if (worker.exitCode !== null) resolve();
      else {
        worker.once("exit", resolve);
        setTimeout(resolve, 3000).unref();
      }
    });
  }
  await rm(state, { recursive: true, force: true });
}
