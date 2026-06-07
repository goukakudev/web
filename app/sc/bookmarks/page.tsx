import type { Metadata } from "next"
import Link from "next/link"
import { ScPageFrame } from "@/components/sc/ScPageFrame"
import { ScBreadcrumbs } from "@/components/sc/ScBreadcrumbs"
import { ScSectionHead } from "@/components/sc/ScChrome"
import { ScQuestionList } from "@/components/sc/ScQuestionList"

export const metadata: Metadata = {
  title: "ブックマークした問題 (情報処理安全確保支援士試験)",
  description: "情報処理安全確保支援士試験でブックマークした問題の一覧。",
  robots: { index: false, follow: true },
}

export default function ScBookmarksPage() {
  return (
    <ScPageFrame title="ブックマーク">
      <ScBreadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: "ブックマーク", href: "/sc/bookmarks" },
      ]} />
      <p className="sc-page-subtitle">BOOKMARKED</p>
      <h1 className="sc-page-title">ブックマークした問題</h1>
      <p className="sc-page-lead">
        SC で星 (☆) を付けた問題の一覧です。ローカル端末のみに保存されます。
      </p>
      <ScSectionHead title="一覧" />
      <ScQuestionList mode="bookmarks" />
      <p className="sc-footnote">
        ← <Link href="/sc">情報処理安全確保支援士試験 のトップ</Link>へ
      </p>
    </ScPageFrame>
  )
}
