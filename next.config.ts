import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'api.neynegar1.ir',
        port: '',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
