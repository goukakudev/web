import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "ブックマークした問題 (応用情報技術者)",
  description: "応用情報技術者試験でブックマークした問題の一覧。",
  robots: { index: false, follow: true },
}

export default function ApBookmarksPage() {
  return <QuestionListView mode="bookmarks" subject="ap" />
}
