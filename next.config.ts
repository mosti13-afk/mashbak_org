import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for Cloud Run / Firebase App Hosting
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
