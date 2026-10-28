import { execFileSync } from "node:child_process";

// Workers Builds may clone only the triggering commit. Retrieve the exact
// pinned rollback object instead of assuming the checkout includes its history.
export function resolveRollbackRevision(root, ref) {
  const options = {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  };
  const resolve = () =>
    execFileSync(
      "git",
      ["rev-parse", "--verify", ref + "^{commit}"],
      options,
    ).trim();
  try {
    return resolve();
  } catch (error) {
    if (!/^[a-f0-9]{40}$/i.test(ref))
      throw new Error(
        "Missing rollback commit: use a full 40-character commit SHA in TRUTHSTON_ROLLBACK_REF.",
        { cause: error },
      );
    console.log(
      "Retrieving pinned rollback commit missing from shallow checkout.",
    );
    execFileSync(
      "git",
      ["fetch", "--no-tags", "--depth=1", "origin", ref],
      options,
    );
    const revision = resolve();
    if (revision.toLowerCase() !== ref.toLowerCase())
      throw new Error(
        "Fetched rollback revision does not match the pinned commit.",
      );
    return revision;
  }
}
