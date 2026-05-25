import type { Metadata } from "next";
import Link from "next/link";
import StatsClient from "./StatsClient";

export const metadata: Metadata = {
  title: "学習統計 — 宅建",
  description: "宅建士試験 学習の正答率と進捗",
  robots: { index: false, follow: true },
};

export default function StatsPage() {
  return (
    <main className="min-h-screen bg-tk-bg">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <nav className="mb-6 text-xs tracking-widest text-tk-ink-3">
          <Link href="/takken" className="hover:text-tk-ink-2">
            宅建
          </Link>
          <span className="mx-2">／</span>
          <span>学習統計</span>
        </nav>
        <h1 className="font-mincho text-3xl font-medium tracking-wide text-tk-ink">
          学習統計
        </h1>
        <p className="mt-1 text-xs tracking-widest text-tk-ink-3">
          解答ログから集計 (ブラウザ内に保存)
        </p>
        <StatsClient />
      </div>
    </main>
  );
}
