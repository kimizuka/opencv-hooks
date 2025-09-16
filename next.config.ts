import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
    };

    return config;
  },
};

export default nextConfig;
