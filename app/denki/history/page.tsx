import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "第二種電気工事士 回答履歴",
  robots: { index: false, follow: true },
}

export default function DkHistoryPage() {
  return <QuestionListView mode="history" subject="dk" basePath="/denki" variant="denki" />
}
