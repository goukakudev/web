import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata = {
  title: "ブックマークした問題",
  description: "ブックマークした問題の一覧。",
  alternates: { canonical: "/fe/bookmarks" },
}

export default function BookmarksPage() {
  return <QuestionListView mode="bookmarks" />
}
