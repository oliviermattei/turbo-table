import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// Version of this build, shown in the game and served by /api/version (to check a deploy and spot a stale cache).
// Set once in the environment so every build worker inlines the same values.
// Commit: SOURCE_COMMIT from Coolify (Docker build arg), else git when building locally.
const gitCommit = () => {
  try { return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; }
};
process.env.TT_BUILD_COMMIT ??= (process.env.SOURCE_COMMIT || gitCommit()).slice(0, 7);
process.env.TT_BUILD_TIME ??= new Date().toISOString();

const nextConfig: NextConfig = {
  output: "standalone", // self-contained server for the Docker image (Coolify)
  cacheComponents: true,
  partialPrefetching: true,
  env: { TT_BUILD_COMMIT: process.env.TT_BUILD_COMMIT, TT_BUILD_TIME: process.env.TT_BUILD_TIME },
};

export default nextConfig;
