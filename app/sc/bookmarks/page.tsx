import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "ブックマークした問題 (情報処理安全確保支援士試験)",
  description: "情報処理安全確保支援士試験でブックマークした問題の一覧。",
  robots: { index: false, follow: true },
}

export default function ScBookmarksPage() {
  return <QuestionListView mode="bookmarks" subject="sc" />
}
