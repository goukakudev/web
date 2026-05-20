import Link from "next/link";
import { notFound } from "next/navigation";
import { TakkenAPI } from "@/lib/takken/api";
import type { Metadata } from "next";

type Props = { params: Promise<{ cat: string }> };

const VALID = ["権利関係", "宅建業法", "法令上の制限", "税その他"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  const decoded = decodeURIComponent(cat);
  return {
    title: `${decoded} — 宅建`,
    description: `宅建士試験 ${decoded} 分野の過去問演習。`,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { cat } = await params;
  const decoded = decodeURIComponent(cat);
  if (!VALID.includes(decoded)) notFound();

  const result = await TakkenAPI.listCategoryQuestions(decoded);
  const total = result.count;

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <nav className="mb-8 text-xs tracking-widest text-ink-3">
          <Link href="/" className="hover:text-ink-2">合格.dev</Link>
          <span className="mx-2">／</span>
          <Link href="/takken" className="hover:text-ink-2">宅建</Link>
          <span className="mx-2">／</span>
          <Link href="/takken/categories" className="hover:text-ink-2">分野別</Link>
          <span className="mx-2">／</span>
          <span>{decoded}</span>
        </nav>

        <h1 className="mb-3 font-mincho text-3xl font-semibold tracking-wide text-ink">
          {decoded}
        </h1>
        <p className="mb-8 text-sm text-ink-3">
          全{total}問
        </p>

        <div className="space-y-2.5">
          <Link
            href={`/takken/categories/${encodeURIComponent(decoded)}/quiz`}
            className="btn-primary w-full"
          >
            分野演習を始める ({total}問)
          </Link>
          <Link
            href={`/takken/categories/${encodeURIComponent(decoded)}/quiz?count=10`}
            className="btn-secondary"
          >
            ランダム10問だけ
          </Link>
        </div>
      </div>
    </main>
  );
}
