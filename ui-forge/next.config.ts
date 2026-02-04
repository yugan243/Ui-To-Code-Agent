import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Increase timeout to 60 seconds (or more) for slow AI models
      bodySizeLimit: '2mb',
    },
  },
  // Note: Vercel Pro/Hobby has hard limits (10s/60s). 
  // For local dev, this helps.
};

export default nextConfig;