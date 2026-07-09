/**
 * 検索インデックス許可リスト (2026-07 方針転換 → 段階的緩和)。
 *
 * AdSense の「複製コンテンツ / 有用性の低いコンテンツ」判定を受け、検索
 * エンジンに見せる面をオリジナルコンテンツ中心に絞ったうえで、FE/IP の
 * 厚い設問ページから段階的に戻している。
 *
 *   - 注力試験 (FE / IP) のハブ・講座記事・FAQ・設問一覧
 *   - SG / AP のハブ・ガイド・FAQ (オリジナル記事がある範囲)
 *   - 宅建のハブ・ガイド・FAQ (iOS アプリ導線として維持)
 *   - 用語集 (個別ページの品質判定は glossary-quality 側)
 *   - FE/IP 設問個別ページ (prefix 許可。最終判定は question-quality)
 *   - サイト全体の静的ページ
 *
 * 過去問の設問ページは本文が公開過去問で他サイトと同一になり得るため、
 * 解説が十分なものだけ index (lib/seo/question-quality.ts)。
 * SC / 電気 / 看護 はセクションごと noindex とし、演習ツール・アプリ導線
 * としてはそのまま残す。play URL・tag/year 集約は引き続き noindex。
 *
 * このリストに無いパスは makeMetadata 経由で自動的に noindex になり、
 * sitemap (lib/seo/sitemaps.ts) にも載らない。インデックスさせたいページを
 * 増やすときはここに追加する。
 */

export interface IndexableStaticPage {
  path: string
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never"
  priority: number
}

export const INDEXABLE_STATIC_PAGES: IndexableStaticPage[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/ip", changeFrequency: "weekly", priority: 0.95 },
  { path: "/fe", changeFrequency: "weekly", priority: 0.9 },
  { path: "/sg", changeFrequency: "weekly", priority: 0.75 },
  { path: "/ap", changeFrequency: "weekly", priority: 0.7 },
  { path: "/takken", changeFrequency: "weekly", priority: 0.7 },
  { path: "/ip/questions", changeFrequency: "weekly", priority: 0.85 },
  { path: "/fe/questions", changeFrequency: "weekly", priority: 0.8 },
  { path: "/ip/guide", changeFrequency: "monthly", priority: 0.85 },
  { path: "/ip/mock", changeFrequency: "monthly", priority: 0.78 },
  { path: "/ip/terms", changeFrequency: "monthly", priority: 0.78 },
  { path: "/ip/roadmap", changeFrequency: "monthly", priority: 0.78 },
  { path: "/ip/frequent-topics", changeFrequency: "monthly", priority: 0.78 },
  { path: "/ip/ai-dx-security", changeFrequency: "monthly", priority: 0.78 },
  { path: "/ip/cbt-practice", changeFrequency: "monthly", priority: 0.78 },
  { path: "/ip/30-days", changeFrequency: "monthly", priority: 0.78 },
  { path: "/ip/faq", changeFrequency: "monthly", priority: 0.65 },
  { path: "/fe/guide", changeFrequency: "monthly", priority: 0.72 },
  { path: "/fe/faq", changeFrequency: "monthly", priority: 0.65 },
  { path: "/sg/guide", changeFrequency: "monthly", priority: 0.65 },
  { path: "/sg/faq", changeFrequency: "monthly", priority: 0.55 },
  { path: "/ap/guide", changeFrequency: "monthly", priority: 0.55 },
  { path: "/ap/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/takken/guide", changeFrequency: "monthly", priority: 0.6 },
  { path: "/takken/faq", changeFrequency: "monthly", priority: 0.55 },
  { path: "/glossary", changeFrequency: "weekly", priority: 0.65 },
  { path: "/pro", changeFrequency: "monthly", priority: 0.55 },
  { path: "/methodology", changeFrequency: "yearly", priority: 0.4 },
  { path: "/sources", changeFrequency: "yearly", priority: 0.4 },
  { path: "/about", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
  { path: "/support", changeFrequency: "monthly", priority: 0.4 },
]

const INDEXABLE_EXACT = new Set(INDEXABLE_STATIC_PAGES.map((page) => page.path))

/**
 * 動的ページでインデックスを許可する prefix。
 * 設問個別ページは path としては候補だが、薄い解説は question-quality と
 * question-page-response 側で noindex に落とす。sitemap にも品質通過分のみ載せる。
 */
const INDEXABLE_PREFIXES = [
  "/glossary/",
  "/ip/questions/",
  "/fe/questions/",
]

export function isIndexablePath(path: string): boolean {
  const clean = normalizePath(path)
  if (INDEXABLE_EXACT.has(clean)) return true
  return INDEXABLE_PREFIXES.some((prefix) => clean.startsWith(prefix))
}

function normalizePath(path: string): string {
  const withoutQuery = path.split("?")[0].split("#")[0]
  if (withoutQuery === "" || withoutQuery === "/") return "/"
  return withoutQuery.replace(/\/+$/, "")
}
