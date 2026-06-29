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
          "/ap/play/random",
          "/sg/play/random",
          "/sc/play/random",
          "/denki/play/random",
          "/dk/play/random",
          "/fe/bookmarks",
          "/fe/history",
          "/ip/bookmarks",
          "/ip/history",
          "/ap/bookmarks",
          "/ap/history",
          "/sg/bookmarks",
          "/sg/history",
          "/takken/bookmarks",
          "/takken/wrong",
          "/takken/stats",
          "/takken/search",
          "/kango/bookmarks",
          "/kango/records",
          "/sc/bookmarks",
          "/sc/history",
          "/denki/bookmarks",
          "/denki/history",
          "/dk/bookmarks",
          "/dk/history",
          "/search",
          "/random",
        ],
      },
    ],
    sitemap: "https://goukaku.dev/sitemap.xml",
    host: "https://goukaku.dev",
  }
}
