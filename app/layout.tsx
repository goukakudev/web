import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "goukaku.dev — IT 試験対策クイズ",
  description: "基本情報技術者試験の過去問・解説を無料で学べる Web 学習サイト",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
