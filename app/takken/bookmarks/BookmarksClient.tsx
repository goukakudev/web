"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listBookmarks } from "@/lib/takken/bookmarks";
import { CustomQuizLoader } from "@/components/play/CustomQuizLoader";

export default function BookmarksClient() {
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    setIds(listBookmarks());
  }, []);

  if (ids === null) {
    return (
      <main className="min-h-screen bg-tk-bg">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <p className="text-sm text-tk-ink-3">読み込み中…</p>
        </div>
      </main>
    );
  }

  if (ids.length === 0) {
    return (
      <main className="min-h-screen bg-tk-bg">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <nav className="mb-6 text-xs tracking-widest text-tk-ink-3">
            <Link href="/takken" className="hover:text-tk-ink-2">
              宅建
            </Link>
            <span className="mx-2">／</span>
            <span>ブックマーク</span>
          </nav>
          <h1 className="font-mincho text-3xl font-medium tracking-wide text-tk-ink">
            ブックマーク
          </h1>
          <div className="mt-8 rounded-2xl border border-tk-line bg-tk-card p-8 text-center">
            <p className="font-mincho text-base text-tk-ink">
              まだブックマークがありません
            </p>
            <p className="mt-2 text-xs tracking-wide text-tk-ink-3">
              クイズ画面右上の ★ ボタンで問題を保存できます
            </p>
            <Link
              href="/takken/exams"
              className="btn-primary mt-6 inline-flex"
            >
              年度別演習へ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-tk-bg">
      <CustomQuizLoader
        ids={ids}
        breadcrumb={`ブックマーク (${ids.length}問)`}
        emptyMessage="ブックマークが空です"
      />
    </main>
  );
}
