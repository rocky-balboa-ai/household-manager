import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Fix for Vercel monorepo - set root for file tracing
  outputFileTracingRoot: process.cwd(),
  experimental: {
    // Ensure proper output for Vercel
    outputFileTracingIncludes: {
      '/*': ['./node_modules/**/*'],
    },
  },
};

export default nextConfig;
