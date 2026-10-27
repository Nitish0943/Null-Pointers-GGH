import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    '@mantrix/shared',
    '@mantrix/types',
    '@mantrix/validation',
    '@mantrix/config',
    '@mantrix/firebase',
  ],
};

export default nextConfig;
