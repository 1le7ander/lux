import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
