import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata = {
  title: "ブックマークした問題 (ITパスポート)",
  description: "ITパスポート試験でブックマークした問題の一覧。",
  alternates: { canonical: "/ip/bookmarks" },
}

export default function IpBookmarksPage() {
  return <QuestionListView mode="bookmarks" subject="ip" />
}
