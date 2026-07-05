import {
  listApExams,
  listApQuestions,
  listDkExams,
  listDkQuestions,
  listExams,
  listIpExams,
  listIpQuestions,
  listQuestions,
  listScExams,
  listScQuestions,
  listSgExams,
  listSgQuestions,
} from "@/lib/api-client"
import { TakkenAPI } from "@/lib/takken/api"
import { listKnExams, listKnQuestions } from "@/lib/kango/api"
import { KANGO_CATEGORIES } from "@/lib/kango/categories"
import { listAllTerms, termToSlug } from "@/lib/seo/glossary"
import { isIndexableGlossaryEntry } from "@/lib/seo/glossary-quality"
import {
  questionCanonicalPath,
  type SeoQuestionSubject,
} from "@/lib/seo/question-url"
import type { ExamSummary, Question } from "@/lib/types"

export const SITEMAP_BASE = "https://goukaku.dev"

export const SITEMAP_NAMES = [
  "static",
  "ip-questions",
  "fe-questions",
  "sg-questions",
  "ap-questions",
  "sc-questions",
  "denki-questions",
  "kango-questions",
  "takken-questions",
  "glossary",
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

const NON_INDEXABLE = [
  "/api/",
  "/play/",
  "/play/random",
  "/random",
  "/bookmarks",
  "/history",
  "/records",
  "/wrong",
  "/stats",
  "/search",
  "/diagnosis",
  "/tag/",
  "/year/",
  "?",
]

export function isIndexableSitemapUrl(url: string): boolean {
  if (
    /^https:\/\/goukaku\.dev\/(?:ap|sc|denki|kango)\/play\/[^/]+\/q\/\d+$/.test(
      url,
    )
  ) {
    return true
  }
  // 宅建 quiz はクエリなしの基底 URL のみ。?q=N は canonical を /quiz に
  // 向けた表示状態 URL なので sitemap には載せない。
  if (/^https:\/\/goukaku\.dev\/takken\/exams\/[^/?]+\/quiz$/.test(url)) {
    return true
  }
  return !NON_INDEXABLE.some((fragment) => url.includes(fragment))
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
    .filter((entry) => isIndexableSitemapUrl(entry.url))
    .filter((entry) => {
      if (seen.has(entry.url)) return false
      seen.add(entry.url)
      return true
    })
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
    case "ip-questions":
      return questionEntries("ip")
    case "fe-questions":
      return questionEntries("fe")
    case "sg-questions":
      return questionEntries("sg")
    case "ap-questions":
      return playQuestionEntries("ap", listApExams, listApQuestions, 0.68)
    case "sc-questions":
      return playQuestionEntries("sc", listScExams, listScQuestions, 0.68)
    case "denki-questions":
      return playQuestionEntries("denki", listDkExams, listDkQuestions, 0.68)
    case "kango-questions":
      return playQuestionEntries("kango", listKnExams, listKnQuestions, 0.66)
    case "takken-questions":
      return takkenQuestionEntries()
    case "glossary":
      return glossaryEntries()
  }
}

// NOTE: 各エントリに lastModified を付けない。実際の更新日時を持っていないのに
// 生成時刻を <lastmod> として出すと「全 URL が毎日更新」という虚偽シグナルになり、
// Google は不正確な lastmod を学習して無視する (公式ドキュメント明記)。正確な
// 更新日時を持てるようになるまでは省略する方がクロールシグナルとして健全。
async function staticEntries(): Promise<SitemapEntry[]> {
  const out: SitemapEntry[] = [
    entry("/", "weekly", 1),
    entry("/ip", "weekly", 0.95),
    entry("/fe", "weekly", 0.9),
    entry("/sg", "weekly", 0.9),
    entry("/ap", "weekly", 0.75),
    entry("/sc", "weekly", 0.75),
    entry("/denki", "weekly", 0.75),
    entry("/takken", "weekly", 0.7),
    entry("/kango", "weekly", 0.7),
    entry("/ip/questions", "weekly", 0.85),
    entry("/fe/questions", "weekly", 0.8),
    entry("/sg/questions", "weekly", 0.8),
    entry("/ip/guide", "monthly", 0.85),
    entry("/ip/mock", "monthly", 0.78),
    entry("/ip/terms", "monthly", 0.78),
    entry("/ip/roadmap", "monthly", 0.78),
    entry("/ip/frequent-topics", "monthly", 0.78),
    entry("/ip/ai-dx-security", "monthly", 0.78),
    entry("/ip/cbt-practice", "monthly", 0.78),
    entry("/ip/30-days", "monthly", 0.78),
    entry("/fe/guide", "monthly", 0.72),
    entry("/sg/guide", "monthly", 0.72),
    entry("/ap/guide", "monthly", 0.6),
    entry("/sc/guide", "monthly", 0.6),
    entry("/denki/guide", "monthly", 0.6),
    entry("/takken/guide", "monthly", 0.6),
    entry("/kango/guide", "monthly", 0.6),
    entry("/ip/faq", "monthly", 0.65),
    entry("/fe/faq", "monthly", 0.65),
    entry("/sg/faq", "monthly", 0.65),
    entry("/ap/faq", "monthly", 0.55),
    entry("/sc/faq", "monthly", 0.55),
    entry("/denki/faq", "monthly", 0.55),
    entry("/takken/faq", "monthly", 0.55),
    entry("/kango/faq", "monthly", 0.55),
    entry("/glossary", "weekly", 0.65),
    entry("/pro", "monthly", 0.55),
    entry("/methodology", "yearly", 0.4),
    entry("/sources", "yearly", 0.4),
    entry("/about", "yearly", 0.4),
    entry("/privacy", "yearly", 0.3),
    entry("/terms", "yearly", 0.3),
    entry("/contact", "yearly", 0.3),
    entry("/support", "monthly", 0.4),
  ]

  const [fe, ip, ap, sg, sc, dk, takken, kn] = await Promise.all([
    listExams().catch(() => []),
    listIpExams().catch(() => []),
    listApExams().catch(() => []),
    listSgExams().catch(() => []),
    listScExams().catch(() => []),
    listDkExams().catch(() => []),
    TakkenAPI.listExams().catch(() => []),
    listKnExams().catch(() => []),
  ])

  addExamEntries(out, "fe", fe.filter((exam) => exam.exam_id.startsWith("fe-")))
  addExamEntries(out, "ip", ip)
  addExamEntries(out, "ap", ap)
  addExamEntries(out, "sg", sg)
  addExamEntries(out, "sc", sc)
  addExamEntries(out, "denki", dk)

  for (const exam of takken) {
    out.push({
      url: `${SITEMAP_BASE}/takken/exams/${exam.exam_id}`,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }
  out.push(
    { url: `${SITEMAP_BASE}/takken/exams`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITEMAP_BASE}/takken/categories`, changeFrequency: "weekly", priority: 0.6 },
  )
  for (const cat of ["権利関係", "宅建業法", "法令上の制限", "税その他"]) {
    out.push({
      url: `${SITEMAP_BASE}/takken/categories/${encodeURIComponent(cat)}`,
      changeFrequency: "monthly",
      priority: 0.55,
    })
  }

  for (const exam of kn) {
    out.push({
      url: `${SITEMAP_BASE}/kango/exam/${exam.exam_id}`,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }
  for (const category of KANGO_CATEGORIES) {
    out.push({
      url: `${SITEMAP_BASE}/kango/category/${category.slug}`,
      changeFrequency: "monthly",
      priority: 0.55,
    })
  }

  return out
}

async function questionEntries(subject: SeoQuestionSubject): Promise<SitemapEntry[]> {
  const exams = await listSubjectExams(subject)
  const questionLists = await Promise.all(
    exams.map((exam) => listSubjectQuestions(subject, exam.exam_id).catch(() => [])),
  )
  return exams.flatMap((exam, index) =>
    questionLists[index].map((question) => ({
      url: `${SITEMAP_BASE}${questionCanonicalPath(subject, exam, question)}`,
      changeFrequency: "monthly" as const,
      priority: subject === "ip" ? 0.75 : 0.7,
    })),
  )
}

interface ExamWithId {
  exam_id: string
}

interface QuestionWithNumber {
  q_number: number
}

async function playQuestionEntries(
  subjectPath: "ap" | "sc" | "denki" | "kango",
  listExamsFn: () => Promise<ExamWithId[]>,
  listQuestionsFn: (examId: string) => Promise<QuestionWithNumber[]>,
  priority: number,
): Promise<SitemapEntry[]> {
  const exams = await listExamsFn()
  const questionLists = await Promise.all(
    exams.map((exam) => listQuestionsFn(exam.exam_id).catch(() => [])),
  )
  return exams.flatMap((exam, index) =>
    questionLists[index].map((question) => ({
      url: `${SITEMAP_BASE}/${subjectPath}/play/${exam.exam_id}/q/${question.q_number}`,
      changeFrequency: "monthly" as const,
      priority,
    })),
  )
}

async function takkenQuestionEntries(): Promise<SitemapEntry[]> {
  // 以前は問番号ごとに ?q=N 付き URL を全件登録していたが (試験回 × 最大 50 問
  // = 1,200 URL 超)、クエリ付き近重複ページとして GSC の「クロール済み -
  // インデックス未登録」に滞留するだけだった。canonical は /quiz に統一済み
  // なので、sitemap も試験回ごとの基底 URL 1 件に絞る。
  // ただし listExams() が返す試験回でも、個別の questions が取得できない
  // (インポート未了・データ欠損) ケースはあり得るため、そのままでは 404 する
  // URL を sitemap に載せてしまう。以前の実装はこの existence チェックを
  // 兼ねていたため、ここでも維持する。
  const exams = await TakkenAPI.listExams()
  const results = await Promise.all(
    exams.map((exam) => TakkenAPI.listExamQuestions(exam.exam_id).catch(() => null)),
  )
  return exams.flatMap((exam, index) => {
    if (!results[index]?.questions.length) return []
    return [
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

async function listSubjectExams(subject: SeoQuestionSubject): Promise<ExamSummary[]> {
  if (subject === "ip") return listIpExams()
  if (subject === "sg") return listSgExams()
  return (await listExams()).filter((exam) => exam.exam_id.startsWith("fe-"))
}

async function listSubjectQuestions(
  subject: SeoQuestionSubject,
  examId: string,
): Promise<Question[]> {
  if (subject === "ip") return listIpQuestions(examId)
  if (subject === "sg") return listSgQuestions(examId)
  return listQuestions(examId)
}

function addExamEntries(
  out: SitemapEntry[],
  subject: "fe" | "ip" | "ap" | "sg" | "sc" | "dk" | "denki",
  exams: ExamSummary[],
) {
  for (const exam of exams) {
    out.push({
      url: `${SITEMAP_BASE}/${subject}/exam/${exam.exam_id}`,
      changeFrequency: "monthly",
      priority: subject === "ip" ? 0.8 : 0.7,
    })
  }
  const cats =
    subject === "dk" || subject === "denki"
      ? []
      : subject === "sc"
      ? ["security-tech", "security-management", "law-related"]
      : ["technology", "management", "strategy"]
  for (const cat of cats) {
    out.push({
      url: `${SITEMAP_BASE}/${subject}/category/${cat}`,
      changeFrequency: "monthly",
      priority: 0.58,
    })
  }
}

function entry(
  path: string,
  changeFrequency: SitemapEntry["changeFrequency"],
  priority: number,
): SitemapEntry {
  return {
    url: `${SITEMAP_BASE}${path}`,
    changeFrequency,
    priority,
  }
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
