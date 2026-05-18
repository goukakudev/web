import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/diagnosis", "/play/random"],
      },
    ],
    sitemap: "https://goukaku.dev/sitemap.xml",
    host: "https://goukaku.dev",
  };
}
