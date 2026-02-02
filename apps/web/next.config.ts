import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Fix for Vercel monorepo - set root to monorepo root
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
