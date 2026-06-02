import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "回答履歴 (情報セキュリティマネジメント)",
  description: "情報セキュリティマネジメント試験でこれまでに回答した問題を新しい順に表示します。",
  robots: { index: false, follow: true },
}

export default function SgHistoryPage() {
  return <QuestionListView mode="history" subject="sg" />
}
