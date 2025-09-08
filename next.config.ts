import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|gif|jpg|jpeg|svg)$/,
      type: 'asset/resource',
    });
    return config;
  },
  transpilePackages: ['cesium'],
};

export default nextConfig;
