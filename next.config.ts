import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // self-contained server for the Docker image (Coolify)
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
