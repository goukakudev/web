import { sitemapIndexXml } from "@/lib/seo/sitemaps"

export const revalidate = 86400

export async function GET() {
  return new Response(sitemapIndexXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400",
    },
  })
}
