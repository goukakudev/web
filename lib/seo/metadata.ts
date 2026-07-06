import type { Metadata } from "next"
import { isIndexablePath } from "@/lib/seo/indexing-policy"

export interface MakeMetadataInput {
  title: string
  description: string
  path: string
  type?: "website" | "article"
  ogImagePath?: string
  /**
   * 検索インデックスから除外する。リンクは辿らせる。
   * 未指定なら indexing-policy の許可リストで自動判定する
   * (リスト外のパスは noindex)。明示指定は許可リストより優先。
   */
  noindex?: boolean
}

export function makeMetadata({
  title, description, path, type = "website", ogImagePath, noindex,
}: MakeMetadataInput): Metadata {
  const resolvedNoindex = noindex ?? !isIndexablePath(path)
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(resolvedNoindex ? { robots: { index: false, follow: true } } : {}),
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
