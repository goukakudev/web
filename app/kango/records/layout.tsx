import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "学習記録",
  description: "看護師国家試験 過去問の学習記録 (端末ローカル集計)。",
  alternates: { canonical: "/kango/records" },
  robots: { index: false, follow: true },
}

export default function KangoRecordsLayout({ children }: { children: React.ReactNode }) {
  return children
}
