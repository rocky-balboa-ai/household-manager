import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // output: 'standalone' only needed for Docker/Railway deployment
  // Vercel handles deployment differently
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
