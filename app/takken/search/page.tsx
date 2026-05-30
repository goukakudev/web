import type { Metadata } from "next";
import Link from "next/link";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "検索",
  description: "宅建士試験 過去問の全文検索",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-tk-bg">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <nav className="mb-6 text-xs tracking-widest text-tk-ink-3">
          <Link href="/takken" className="hover:text-tk-ink-2">
            宅建
          </Link>
          <span className="mx-2">／</span>
          <span>検索</span>
        </nav>
        <h1 className="font-mincho text-3xl font-medium tracking-wide text-tk-ink">
          検索
        </h1>
        <p className="mt-1 text-xs tracking-widest text-tk-ink-3">
          過去問の本文・選択肢・解説から全文検索
        </p>
        <SearchClient />
      </div>
    </main>
  );
}
