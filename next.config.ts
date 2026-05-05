import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.neynegar1.ir',
        port: '',
        pathname: '/**'
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['chart.js', 'react-chartjs-2'],
  },
};

export default nextConfig;
