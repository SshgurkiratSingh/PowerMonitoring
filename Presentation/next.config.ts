import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Optimize for presentation mode
  poweredByHeader: false,
  compress: true,
}

export default nextConfig;
