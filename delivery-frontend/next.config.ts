import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  output: "standalone",
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};



export default nextConfig;
