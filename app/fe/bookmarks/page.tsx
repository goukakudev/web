import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "ブックマークした問題",
  description: "ブックマークした問題の一覧。",
  robots: { index: false, follow: true },
}

export default function BookmarksPage() {
  return <QuestionListView mode="bookmarks" />
}
