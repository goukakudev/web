import type { Metadata } from "next"

export interface MakeMetadataInput {
  title: string
  description: string
  path: string
  type?: "website" | "article"
  ogImagePath?: string
  /** 検索インデックスから除外する (薄い集約ページなど)。リンクは辿らせる。 */
  noindex?: boolean
}

export function makeMetadata({
  title, description, path, type = "website", ogImagePath, noindex,
}: MakeMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type, title, description, url: path, locale: "ja_JP",
      ...(ogImagePath ? { images: [{ url: ogImagePath }] } : {}),
    },
    twitter: {
      card: "summary_large_image", title, description,
      ...(ogImagePath ? { images: [ogImagePath] } : {}),
    },
  }
}
