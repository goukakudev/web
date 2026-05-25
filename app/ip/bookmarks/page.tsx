import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "ブックマークした問題 (ITパスポート)",
  description: "ITパスポート試験でブックマークした問題の一覧。",
  robots: { index: false, follow: true },
}

export default function IpBookmarksPage() {
  return <QuestionListView mode="bookmarks" subject="ip" />
}
