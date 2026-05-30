import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "回答履歴 (応用情報技術者)",
  description: "応用情報技術者試験でこれまでに回答した問題を新しい順に表示します。",
  robots: { index: false, follow: true },
}

export default function ApHistoryPage() {
  return <QuestionListView mode="history" subject="ap" />
}
