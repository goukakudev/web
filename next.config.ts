import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build a minimal standalone Node server (.next/standalone/server.js) so the
  // app runs inside the Cloudflare Containers image. See Dockerfile.
  output: "standalone",
  // OG image fonts are read at runtime via fs (lib/seo/og.tsx). File tracing
  // can't follow the dynamic readFile paths, so include them explicitly in the
  // standalone output.
  outputFileTracingIncludes: {
    "/**": ["./lib/seo/fonts/**/*"],
  },
  // NOTE: experimental.inlineCss was previously enabled to avoid a
  // render-blocking CSS <link> (PageSpeed audit). But the global stylesheet is
  // ~100KB — far past the ~14KB "critical CSS" inlining threshold — so inlining
  // it bloated every HTML document (~100KB, re-sent on every full load, never
  // cached) and delayed first paint. Reverting to a linked stylesheet keeps the
  // HTML light and lets the edge/browser cache the CSS once per session.
  async redirects() {
    return [
      // Legacy FE URLs → /fe/* (kept for SEO / external links)
      { source: "/play/:examId", destination: "/fe/play/:examId", permanent: true },
      { source: "/play/:examId/q/:qNumber", destination: "/fe/play/:examId/q/:qNumber", permanent: true },
      { source: "/play/random", destination: "/fe/play/random", permanent: true },
      { source: "/tag/:tag", destination: "/fe/tag/:tag", permanent: true },
      { source: "/exam/:examId", destination: "/fe/exam/:examId", permanent: true },
      // /denki is the canonical public path. Keep /dk as a permanent alias
      // for old links, but do not serve it as a separate indexable surface.
      { source: "/dk/:path*", destination: "/denki/:path*", permanent: true },
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
