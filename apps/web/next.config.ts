import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@mantrix/shared',
    '@mantrix/types',
    '@mantrix/validation',
    '@mantrix/config',
    '@mantrix/firebase',
  ],
};

export default nextConfig;
