import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "学習診断",
  description:
    "あなたの解答履歴と試験別の正答率をローカルに集計して可視化します。",
  robots: { index: false, follow: true },
};

export default function DiagnosisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
