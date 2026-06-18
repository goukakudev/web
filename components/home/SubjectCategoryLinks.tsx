import Link from "next/link"
import { FE_CATEGORIES } from "@/lib/seo/category-meta/fe"
import { IP_CATEGORIES } from "@/lib/seo/category-meta/ip"
import { AP_CATEGORIES } from "@/lib/seo/category-meta/ap"
import { SG_CATEGORIES } from "@/lib/seo/category-meta/sg"
import type { CategoryMeta } from "@/lib/seo/category-meta/fe"

export type CategoryLinkSubject = "fe" | "ip" | "ap" | "sg"

const CATEGORIES: Record<CategoryLinkSubject, CategoryMeta[]> = {
  fe: FE_CATEGORIES,
  ip: IP_CATEGORIES,
  ap: AP_CATEGORIES,
  sg: SG_CATEGORIES,
}

/**
 * 資格別入口から分野(カテゴリ)ハブ /{sub}/category/{slug} への内部リンク。
 *
 * これまで fe/ip/ap/sg の分野ハブは sitemap には載るが内部リンクが 1 本も無い
 * 孤立ページで、評価(内部リンク)が集まらなかった。入口ページから 3 分野へ明示的に
 * リンクすることで、indexable な分野ハブへ評価を流し、利用者にも分野別導線を提供する。
 */
export function SubjectCategoryLinks({ subject }: { subject: CategoryLinkSubject }) {
  const cats = CATEGORIES[subject]
  if (!cats || cats.length === 0) return null
  return (
    <section className="mt-9">
      <h2 className="text-[18px] font-extrabold mb-3.5">分野別に過去問を解く</h2>
      <ul className="grid grid-cols-1 gap-2.5">
        {cats.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/${subject}/category/${c.slug}`}
              className="block rounded-2xl border border-goukaku-divider bg-goukaku-surface/40 p-3.5 hover:bg-goukaku-surface"
            >
              <div className="text-[14px] font-extrabold">{c.name} の過去問</div>
              <div className="mt-1 text-[12px] leading-relaxed opacity-65 line-clamp-2">
                {c.description.slice(0, 64)}…
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
