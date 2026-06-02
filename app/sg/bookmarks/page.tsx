import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "ブックマークした問題 (情報セキュリティマネジメント)",
  description: "情報セキュリティマネジメント試験でブックマークした問題の一覧。",
  robots: { index: false, follow: true },
}

export default function SgBookmarksPage() {
  return <QuestionListView mode="bookmarks" subject="sg" />
}
