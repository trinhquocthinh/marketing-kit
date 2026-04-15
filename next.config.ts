import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.izion24.com.vn",
      },
    ],
  },
};

export default nextConfig;
