import type { Metadata } from "next"
import Link from "next/link"
import { ScPageFrame } from "@/components/sc/ScPageFrame"
import { ScBreadcrumbs } from "@/components/sc/ScBreadcrumbs"
import { ScSectionHead } from "@/components/sc/ScChrome"
import { ScQuestionList } from "@/components/sc/ScQuestionList"

export const metadata: Metadata = {
  title: "回答履歴 (情報処理安全確保支援士試験)",
  description: "情報処理安全確保支援士試験でこれまでに回答した問題を新しい順に表示します。",
  robots: { index: false, follow: true },
}

export default function ScHistoryPage() {
  return (
    <ScPageFrame title="回答履歴">
      <ScBreadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: "回答履歴", href: "/sc/history" },
      ]} />
      <p className="sc-page-subtitle">HISTORY</p>
      <h1 className="sc-page-title">回答履歴</h1>
      <p className="sc-page-lead">
        SC で回答した問題を新しい順に表示します。ローカル端末のみに保存されます。
      </p>
      <ScSectionHead title="一覧" />
      <ScQuestionList mode="history" />
      <p className="sc-footnote">
        ← <Link href="/sc">情報処理安全確保支援士試験 のトップ</Link>へ
      </p>
    </ScPageFrame>
  )
}
