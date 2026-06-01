import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  async redirects() {
    return [
      // Legacy FE URLs → /fe/* (kept for SEO / external links)
      { source: "/play/:examId", destination: "/fe/play/:examId", permanent: true },
      { source: "/play/:examId/q/:qNumber", destination: "/fe/play/:examId/q/:qNumber", permanent: true },
      { source: "/play/random", destination: "/fe/play/random", permanent: true },
      { source: "/tag/:tag", destination: "/fe/tag/:tag", permanent: true },
      { source: "/exam/:examId", destination: "/fe/exam/:examId", permanent: true },
    ];
  },
};

export default nextConfig;
