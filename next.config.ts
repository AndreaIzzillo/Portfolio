import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // Static hosting cannot run Next.js' image optimization endpoint.
    unoptimized: true,
  },
};

export default nextConfig;
