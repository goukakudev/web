import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata = {
  title: "回答履歴 (ITパスポート)",
  description: "ITパスポート試験でこれまでに回答した問題を新しい順に表示します。",
  alternates: { canonical: "/ip/history" },
}

export default function IpHistoryPage() {
  return <QuestionListView mode="history" subject="ip" />
}
