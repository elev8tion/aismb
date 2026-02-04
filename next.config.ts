import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' for Cloudflare Pages deployment with API routes
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
