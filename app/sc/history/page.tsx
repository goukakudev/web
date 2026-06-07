import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "回答履歴 (情報処理安全確保支援士試験)",
  description: "情報処理安全確保支援士試験でこれまでに回答した問題を新しい順に表示します。",
  robots: { index: false, follow: true },
}

export default function ScHistoryPage() {
  return <QuestionListView mode="history" subject="sc" />
}
