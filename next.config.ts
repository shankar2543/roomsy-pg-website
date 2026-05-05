import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com", "images.unsplash.com"],
  },
  async rewrites() {
    return [
      {
        source: "/apple-touch-icon.png",
        destination: "/favicon.png",
      },
    ];
  },
};

export default nextConfig;
