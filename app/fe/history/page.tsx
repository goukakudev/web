import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "回答履歴",
  description: "これまでに回答した問題を新しい順に表示します。",
  robots: { index: false, follow: true },
}

export default function HistoryPage() {
  return <QuestionListView mode="history" />
}
