import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import {
  collectionPageJsonLd,
  SITE_URL,
} from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { listAllTerms, listByCategory, termToSlug } from "@/lib/seo/glossary"

const TITLE = "IT・資格 用語集 — 合格.dev"
const DESCRIPTION =
  "情報処理試験(基本情報技術者試験・IT パスポート試験)で頻出のIT用語、アルゴリズム・データ構造、ネットワーク、データベース、セキュリティ、経営戦略、プロジェクトマネジメント等の用語を分野別に解説。各用語は出典・関連条文・関連語句付き。"

export const metadata: Metadata = makeMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/glossary",
})

export default function GlossaryIndexPage() {
  const all = listAllTerms()
  const byCategory = listByCategory()
  const categories = [...byCategory.keys()].sort((a, b) =>
    a.localeCompare(b, "ja"),
  )

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "用語集", href: "/glossary" },
      ]} />
      <JsonLd
        data={collectionPageJsonLd({
          name: TITLE,
          description: DESCRIPTION,
          url: `${SITE_URL}/glossary`,
          items: all.map((e) => ({
            name: e.term,
            url: `${SITE_URL}/glossary/${termToSlug(e.term)}`,
          })),
        })}
      />

      <h1 className="text-[22px] font-extrabold mb-3">用語集</h1>
      <p className="text-[13px] leading-[1.85] text-goukaku-ink/80 mb-6">
        合格.dev で扱う情報処理試験・IT 系資格試験に頻出の IT 用語、アルゴリズム・データ構造、ネットワーク、データベース、セキュリティ、経営戦略、プロジェクトマネジメント等の用語を、分野別に {all.length} 項目掲載しています。各用語の詳細ページでは、定義・関連用語へのリンクをまとめています。
      </p>

      <nav aria-label="カテゴリ別目次" className="mb-7 rounded-2xl border border-goukaku-divider bg-goukaku-surface/40 p-4">
        <p className="text-[11px] tracking-widest text-goukaku-ink/55 mb-2">カテゴリ別</p>
        <ul className="grid grid-cols-2 gap-1.5">
          {categories.map((cat) => (
            <li key={cat}>
              <a
                href={`#${encodeURIComponent(cat)}`}
                className="block rounded-md px-2 py-1 text-[12px] underline decoration-dotted hover:no-underline"
              >
                <span className="font-bold">{cat}</span>
                <span className="ml-1.5 text-[11px] opacity-60 tabular-nums">
                  {byCategory.get(cat)!.length}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {categories.map((cat) => {
        const items = byCategory.get(cat)!
        return (
          <section key={cat} id={encodeURIComponent(cat)} className="mb-7">
            <h2 className="text-[16px] font-extrabold mb-3 text-goukaku-ink/85">
              {cat} ({items.length})
            </h2>
            <ul className="grid grid-cols-2 gap-1">
              {items.map((e) => (
                <li key={e.term}>
                  <Link
                    href={`/glossary/${termToSlug(e.term)}`}
                    className="block rounded-md px-2 py-1 text-[12px] hover:bg-goukaku-surface/60"
                  >
                    {e.term}
                    <span className="block text-[10px] opacity-50">
                      {e.reading}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <p className="text-[11px] opacity-60 pt-6 mt-8 border-t border-goukaku-divider">
        ← <Link href="/" className="underline">合格.dev トップ</Link>
      </p>
    </MobileFrame>
  )
}
