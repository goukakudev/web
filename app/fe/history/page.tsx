import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata = {
  title: "回答履歴",
  description: "これまでに回答した問題を新しい順に表示します。",
  alternates: { canonical: "/fe/history" },
}

export default function HistoryPage() {
  return <QuestionListView mode="history" />
}
