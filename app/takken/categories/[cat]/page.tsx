import Link from "next/link";
import { notFound } from "next/navigation";
import { TakkenAPI } from "@/lib/takken/api";
import type { Metadata } from "next";
import { makeMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

type Props = { params: Promise<{ cat: string }> };

const VALID = ["権利関係", "宅建業法", "法令上の制限", "税その他"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  const decoded = decodeURIComponent(cat);
  return makeMetadata({
    title: `${decoded} 過去問`,
    description: `宅地建物取引士試験 ${decoded} 分野の過去問演習。出題傾向と頻出論点を解説付きで。`,
    path: `/takken/categories/${cat}`,
  });
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
        <Breadcrumbs items={[
          { name: "合格.dev", href: "/" },
          { name: "宅建", href: "/takken" },
          { name: "分野別", href: "/takken/categories" },
          { name: decoded, href: `/takken/categories/${cat}` },
        ]} />

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
