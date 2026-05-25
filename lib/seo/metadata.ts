import type { Metadata } from "next"

export interface MakeMetadataInput {
  title: string
  description: string
  path: string
  type?: "website" | "article"
  ogImagePath?: string
}

export function makeMetadata({
  title, description, path, type = "website", ogImagePath,
}: MakeMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
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
