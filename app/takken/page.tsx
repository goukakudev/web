import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"

export const metadata = {
  title: "宅地建物取引士 過去問 (準備中)",
  description:
    "宅地建物取引士試験の過去問学習。現在準備中です。",
  alternates: { canonical: "/takken" },
}

export default function TakkenPage() {
  return (
    <MobileFrame>
      <Link href="/" className="inline-block text-[14px] mb-4">
        ← カテゴリ一覧
      </Link>
      <header className="pt-2 pb-6">
        <div
          className="text-[24px] text-goukaku-pink-script leading-none"
          style={{ fontFamily: "var(--font-script)" }}
        >
          Takken
        </div>
        <h1 className="text-[22px] font-extrabold mt-2">宅地建物取引士</h1>
        <p className="text-[13px] opacity-65 mt-2 leading-relaxed">
          Real Estate Transaction Agent
        </p>
      </header>

      <section className="p-6 rounded-2xl border border-goukaku-divider bg-goukaku-surface">
        <div className="text-[15px] font-bold mb-2">準備中</div>
        <p className="text-[13px] opacity-75 leading-relaxed">
          宅建の過去問題と解説は現在準備中です。問題データの収録ができ次第、こちらで提供します。
        </p>
      </section>

      <div className="mt-6">
        <Link
          href="/fe"
          className="inline-block text-[13px] underline opacity-80"
        >
          基本情報技術者試験はこちら →
        </Link>
      </div>
    </MobileFrame>
  )
}
