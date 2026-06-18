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
      // 外部被リンク/過去URL由来の連番サフィックス (/.../q/69-3 等) を正規の問題ページへ 301。
      // q 番号は整数のみで、ハイフン付きの正規問題は存在しないため一律除去で安全。
      // (発生源は現行コードには無く、これらは sitemap 外で 404 になっていた)
      {
        source: "/:sub(fe|ip|ap|sg|sc|kango)/play/:examId/q/:n(\\d+)-:suffix",
        destination: "/:sub/play/:examId/q/:n",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
