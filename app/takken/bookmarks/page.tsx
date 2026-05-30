import type { Metadata } from "next";
import BookmarksClient from "./BookmarksClient";

export const metadata: Metadata = {
  title: "ブックマーク",
  description: "★保存した問題で演習",
  robots: { index: false, follow: true },
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}
