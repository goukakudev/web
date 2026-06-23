import type { Metadata } from "next"
import { QuestionListView } from "@/components/play/QuestionListView"

export const metadata: Metadata = {
  title: "第二種電気工事士 ブックマーク",
  robots: { index: false, follow: true },
}

export default function DkBookmarksPage() {
  return <QuestionListView mode="bookmarks" subject="dk" />
}
