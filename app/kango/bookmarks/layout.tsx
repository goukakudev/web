import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ブックマーク",
  description: "看護師国家試験 過去問のブックマーク一覧 (端末ローカル)。",
  alternates: { canonical: "/kango/bookmarks" },
  robots: { index: false, follow: true },
}

export default function KangoBookmarksLayout({ children }: { children: React.ReactNode }) {
  return children
}
