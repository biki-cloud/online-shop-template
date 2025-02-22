import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    newDevOverlay: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { module: /node_modules\/punycode\/punycode\.js/ },
    ];
    return config;
  },
};

export default nextConfig;
