import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for production Docker builds
  output: process.env.NODE_ENV === "production" && process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
