import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/diagnosis",
          "/fe/play/random",
          "/ip/play/random",
          "/fe/bookmarks",
          "/fe/history",
          "/ip/bookmarks",
          "/ip/history",
          "/takken/bookmarks",
          "/takken/wrong",
          "/takken/stats",
          "/takken/search",
        ],
      },
    ],
    sitemap: "https://goukaku.dev/sitemap.xml",
    host: "https://goukaku.dev",
  }
}
