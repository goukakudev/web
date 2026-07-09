import {
  listExams,
  listIpExams,
  listIpQuestions,
  listQuestions,
  listSgExams,
  listSgQuestions,
} from "@/lib/api-client"
import { listAllTerms, termToSlug } from "@/lib/seo/glossary"
import { isIndexableGlossaryEntry } from "@/lib/seo/glossary-quality"
import {
  INDEXABLE_STATIC_PAGES,
  isIndexablePath,
  isIndexableQuestionSubject,
  type IndexableQuestionSubject,
} from "@/lib/seo/indexing-policy"
import { isIndexableQuestion } from "@/lib/seo/question-quality"
import { questionCanonicalPath } from "@/lib/seo/question-url"
import { TakkenAPI } from "@/lib/takken/api"
import type { ExamSummary, Question } from "@/lib/types"

export const SITEMAP_BASE = "https://goukaku.dev"

// 2026-07 方針転換の段階的緩和: static (+ FE/IP/SG 試験回・宅建 exam/quiz) +
// glossary + FE/IP/SG の品質通過設問。AP/SC/電気/看護 設問はまだ載せない。
// 方針の全体像は lib/seo/indexing-policy.ts / question-quality.ts を参照。
export const SITEMAP_NAMES = [
  "static",
  "glossary",
  "ip-questions",
  "fe-questions",
  "sg-questions",
] as const

export type SitemapName = (typeof SITEMAP_NAMES)[number]

export interface SitemapEntry {
  url: string
  lastModified?: Date | string
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never"
  priority?: number
}

/** sitemap 用にクエリ・ハッシュを落とし、trailing slash を正規化する。 */
export function canonicalizeSitemapUrl(url: string): string | null {
  if (!url.startsWith(SITEMAP_BASE)) return null
  try {
    const parsed = new URL(url)
    if (parsed.origin !== SITEMAP_BASE) return null
    const path =
      parsed.pathname === "" || parsed.pathname === "/"
        ? "/"
        : parsed.pathname.replace(/\/+$/, "")
    return `${SITEMAP_BASE}${path === "/" ? "" : path}` || SITEMAP_BASE
  } catch {
    return null
  }
}

export function isIndexableSitemapUrl(url: string): boolean {
  const canonical = canonicalizeSitemapUrl(url)
  if (!canonical) return false
  const path = canonical.slice(SITEMAP_BASE.length) || "/"
  return isIndexablePath(path)
}

export function sitemapIndexXml(now = new Date()): string {
  const lastmod = now.toISOString()
  const body = SITEMAP_NAMES.map(
    (name) => `  <sitemap>
    <loc>${SITEMAP_BASE}/sitemaps/${name}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  ).join("\n")
  return xml(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`)
}

export function urlsetXml(entries: SitemapEntry[]): string {
  const seen = new Set<string>()
  const rows = entries
    .map((entry) => {
      const canonical = canonicalizeSitemapUrl(entry.url)
      if (!canonical || !isIndexablePath(canonical.slice(SITEMAP_BASE.length) || "/")) {
        return null
      }
      if (seen.has(canonical)) return null
      seen.add(canonical)
      return { ...entry, url: canonical }
    })
    .filter((entry): entry is SitemapEntry => entry !== null)
    .map((entry) => {
      const lastmod = entry.lastModified
        ? toIsoDate(entry.lastModified)
        : undefined
      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${
        entry.changeFrequency
          ? `\n    <changefreq>${entry.changeFrequency}</changefreq>`
          : ""
      }${entry.priority !== undefined ? `\n    <priority>${entry.priority}</priority>` : ""}
  </url>`
    })
    .join("\n")
  return xml(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</urlset>`)
}

export async function sitemapEntries(name: SitemapName): Promise<SitemapEntry[]> {
  switch (name) {
    case "static":
      return staticEntries()
    case "glossary":
      return glossaryEntries()
    case "ip-questions":
      return questionEntries("ip")
    case "fe-questions":
      return questionEntries("fe")
    case "sg-questions":
      return questionEntries("sg")
  }
}

// NOTE: 各エントリに lastModified を付けない。実際の更新日時を持っていないのに
// 生成時刻を <lastmod> として出すと「全 URL が毎日更新」という虚偽シグナルになり、
// Google は不正確な lastmod を学習して無視する (公式ドキュメント明記)。正確な
// 更新日時を持てるようになるまでは省略する方がクロールシグナルとして健全。
async function staticEntries(): Promise<SitemapEntry[]> {
  const pages = INDEXABLE_STATIC_PAGES.map((page) => ({
    url: `${SITEMAP_BASE}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
  const [examHubs, takken] = await Promise.all([
    seoExamHubEntries(),
    takkenExamEntries(),
  ])
  return [...pages, ...examHubs, ...takken]
}

/** FE/IP/SG の試験回ハブ。設問が 1 問以上ある回だけ載せる。 */
async function seoExamHubEntries(): Promise<SitemapEntry[]> {
  const subjects: Array<{
    subject: IndexableQuestionSubject
    priority: number
  }> = [
    { subject: "ip", priority: 0.8 },
    { subject: "fe", priority: 0.72 },
    { subject: "sg", priority: 0.7 },
  ]
  const lists = await Promise.all(
    subjects.map(({ subject }) =>
      listSubjectExams(subject).catch(() => [] as ExamSummary[]),
    ),
  )
  const out: SitemapEntry[] = []
  subjects.forEach(({ subject, priority }, i) => {
    for (const exam of lists[i]) {
      if (exam.question_count <= 0) continue
      out.push({
        url: `${SITEMAP_BASE}/${subject}/exam/${exam.exam_id}`,
        changeFrequency: "monthly",
        priority,
      })
    }
  })
  return out
}

/**
 * 宅建: 試験回ハブ + quiz 基底 URL のみ。
 * ?q=N は出さない (GSC 近重複滞留の再発防止)。questions が取れる回だけ載せる。
 */
async function takkenExamEntries(): Promise<SitemapEntry[]> {
  const exams = await TakkenAPI.listExams().catch(() => [])
  const results = await Promise.all(
    exams.map((exam) =>
      TakkenAPI.listExamQuestions(exam.exam_id).catch(() => null),
    ),
  )
  return exams.flatMap((exam, index) => {
    if (!results[index]?.questions.length) return []
    return [
      {
        url: `${SITEMAP_BASE}/takken/exams/${exam.exam_id}`,
        changeFrequency: "monthly" as const,
        priority: 0.62,
      },
      {
        url: `${SITEMAP_BASE}/takken/exams/${exam.exam_id}/quiz`,
        changeFrequency: "monthly" as const,
        priority: 0.66,
      },
    ]
  })
}

function glossaryEntries(): SitemapEntry[] {
  return listAllTerms()
    .filter(isIndexableGlossaryEntry)
    .map((term) => ({
      url: `${SITEMAP_BASE}/glossary/${termToSlug(term.term)}`,
      changeFrequency: "monthly",
      priority: 0.45,
    }))
}

async function questionEntries(
  subject: IndexableQuestionSubject,
): Promise<SitemapEntry[]> {
  if (!isIndexableQuestionSubject(subject)) return []

  const exams = await listSubjectExams(subject)
  const questionLists = await Promise.all(
    exams.map((exam) => listSubjectQuestions(subject, exam.exam_id).catch(() => [])),
  )
  const priority = subject === "ip" ? 0.75 : subject === "fe" ? 0.7 : 0.68
  return exams.flatMap((exam, index) =>
    questionLists[index]
      .filter(isIndexableQuestion)
      .map((question) => ({
        url: `${SITEMAP_BASE}${questionCanonicalPath(subject, exam, question)}`,
        changeFrequency: "monthly" as const,
        priority,
      })),
  )
}

async function listSubjectExams(
  subject: IndexableQuestionSubject,
): Promise<ExamSummary[]> {
  if (subject === "ip") return listIpExams()
  if (subject === "sg") return listSgExams()
  return (await listExams()).filter((exam) => exam.exam_id.startsWith("fe-"))
}

async function listSubjectQuestions(
  subject: IndexableQuestionSubject,
  examId: string,
): Promise<Question[]> {
  if (subject === "ip") return listIpQuestions(examId)
  if (subject === "sg") return listSgQuestions(examId)
  return listQuestions(examId)
}

function toIsoDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function xml(value: string): string {
  return value.trim() + "\n"
}
