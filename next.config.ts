import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for production builds
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
