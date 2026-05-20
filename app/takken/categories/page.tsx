import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "分野別 — 宅建",
  description: "宅建士試験の分野別過去問演習。権利関係・宅建業法・法令上の制限・税その他。",
};

const CATEGORIES = [
  { name: "権利関係", subtitle: "民法・借地借家法・区分所有法 等", gradient: "from-[#8c7367] to-[#574039]" },
  { name: "宅建業法", subtitle: "宅建業法・施行規則 等", gradient: "from-[#b89770] to-[#806649]" },
  { name: "法令上の制限", subtitle: "都市計画・建築基準・国土利用 等", gradient: "from-[#737a73] to-[#474a47]" },
  { name: "税その他", subtitle: "税法・地価公示・統計 等", gradient: "from-[#998071] to-[#665244]" },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <nav className="mb-8 text-xs tracking-widest text-ink-3">
          <Link href="/" className="hover:text-ink-2">合格.dev</Link>
          <span className="mx-2">／</span>
          <Link href="/takken" className="hover:text-ink-2">宅建</Link>
          <span className="mx-2">／</span>
          <span>分野別</span>
        </nav>

        <h1 className="mb-8 font-mincho text-3xl font-semibold tracking-wide text-ink">
          分野別に学習
        </h1>

        <div className="space-y-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              href={`/takken/categories/${encodeURIComponent(c.name)}`}
              className="flex items-center gap-3.5 rounded-2xl border border-line bg-bg p-4 transition hover:bg-canvas"
            >
              <div
                className={`h-[78px] w-[78px] rounded-xl bg-gradient-to-br ${c.gradient}`}
              />
              <div className="flex-1">
                <h2 className="font-mincho text-lg font-semibold text-ink">
                  {c.name}
                </h2>
                <p className="mt-1 text-xs text-ink-3">{c.subtitle}</p>
              </div>
              <span className="text-ink-4">›</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
