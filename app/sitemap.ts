import type { MetadataRoute } from "next"
import {
  listExams,
  listQuestions,
  listIpExams,
  listIpQuestions,
  listApExams,
  listApQuestions,
  listSgExams,
  listSgQuestions,
  listScExams,
  listScQuestions,
  listDkExams,
  listDkQuestions,
} from "@/lib/api-client"
import { TakkenAPI } from "@/lib/takken/api"
import { listKnExams, listAllKnQuestions } from "@/lib/kango/api"
import { KANGO_CATEGORIES } from "@/lib/kango/categories"

const BASE = "https://goukaku.dev"

// 注意: tag / year の集約ページは sitemap に含めない。これらは個別問題ページへの
// 純粋なリンク集約で独自テキストが薄く、各ページ側で robots noindex を付与している
// (AdSense「有用性の低いコンテンツ」対策)。category ページは独自の分野解説があるため残す。

// robots.ts の disallow / 各ページの noindex と整合する最終ガード。partition 側の
// 取りこぼしや将来の追加ミスがあっても、非 indexable な URL を sitemap から確実に除外する。
// 「sitemap に載る URL = 200 を返す indexable な正規 URL」を保証する単一の関所。
const NON_INDEXABLE = [
  "/api/",
  "/play/random",
  "/bookmarks",
  "/history",
  "/records",
  "/wrong",
  "/stats",
  "/search",
  "/diagnosis",
  "/tag/",
  "/year/",
]

export function isIndexableSitemapUrl(url: string): boolean {
  return !NON_INDEXABLE.some((p) => url.includes(p))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [root, fe, ip, ap, sg, sc, dk, takken, kn, glossary] = await Promise.all([
    Promise.resolve(rootPartition()),
    fePartition(),
    ipPartition(),
    apPartition(),
    sgPartition(),
    scPartition(),
    dkPartition(),
    takkenPartition(),
    knPartition(),
    glossaryPartition(),
  ])
  // indexable な正規 URL だけを残し、重複も除去する。
  const seen = new Set<string>()
  const out: MetadataRoute.Sitemap = []
  for (const entry of [...root, ...fe, ...ip, ...ap, ...sg, ...sc, ...dk, ...takken, ...kn, ...glossary]) {
    if (!isIndexableSitemapUrl(entry.url)) continue
    if (seen.has(entry.url)) continue
    seen.add(entry.url)
    out.push(entry)
  }
  return out
}

function rootPartition(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/fe`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/ip`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/ap`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/sg`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/sc`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/dk`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/takken`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/fe/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ip/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ap/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/sg/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/sc/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/dk/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/takken/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/fe/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/ip/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/ap/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/sg/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/sc/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/dk/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/takken/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/methodology`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/sources`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/glossary`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ]
}

async function fePartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = []
  const exams = await listExams().catch(() => [])
  const questionLists = await Promise.all(
    exams.map((e) => listQuestions(e.exam_id).catch(() => [])),
  )
  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i]
    out.push({
      url: `${BASE}/fe/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    for (const q of questionLists[i]) {
      out.push({
        url: `${BASE}/fe/play/${exam.exam_id}/q/${q.q_number}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }
  for (const slug of ["technology", "management", "strategy"]) {
    out.push({
      url: `${BASE}/fe/category/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  }
  return out
}

async function ipPartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = []
  const exams = await listIpExams().catch(() => [])
  const questionLists = await Promise.all(
    exams.map((e) => listIpQuestions(e.exam_id).catch(() => [])),
  )
  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i]
    out.push({
      url: `${BASE}/ip/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    for (const q of questionLists[i]) {
      out.push({
        url: `${BASE}/ip/play/${exam.exam_id}/q/${q.q_number}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }
  for (const slug of ["technology", "management", "strategy"]) {
    out.push({
      url: `${BASE}/ip/category/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  }
  return out
}

async function apPartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = []
  const exams = await listApExams().catch(() => [])
  const questionLists = await Promise.all(
    exams.map((e) => listApQuestions(e.exam_id).catch(() => [])),
  )
  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i]
    out.push({
      url: `${BASE}/ap/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    for (const q of questionLists[i]) {
      out.push({
        url: `${BASE}/ap/play/${exam.exam_id}/q/${q.q_number}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }
  for (const slug of ["technology", "management", "strategy"]) {
    out.push({
      url: `${BASE}/ap/category/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  }
  return out
}

async function sgPartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = []
  const exams = await listSgExams().catch(() => [])
  const questionLists = await Promise.all(
    exams.map((e) => listSgQuestions(e.exam_id).catch(() => [])),
  )
  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i]
    out.push({
      url: `${BASE}/sg/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    for (const q of questionLists[i]) {
      out.push({
        url: `${BASE}/sg/play/${exam.exam_id}/q/${q.q_number}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }
  for (const slug of ["technology", "management", "strategy"]) {
    out.push({
      url: `${BASE}/sg/category/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  }
  return out
}

async function scPartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = []
  const exams = await listScExams().catch(() => [])
  const questionLists = await Promise.all(
    exams.map((e) => listScQuestions(e.exam_id).catch(() => [])),
  )
  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i]
    out.push({
      url: `${BASE}/sc/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    for (const q of questionLists[i]) {
      out.push({
        url: `${BASE}/sc/play/${exam.exam_id}/q/${q.q_number}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }
  for (const slug of ["security-tech", "security-management", "law-related"]) {
    out.push({
      url: `${BASE}/sc/category/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  }
  return out
}

async function dkPartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = []
  const exams = await listDkExams().catch(() => [])
  const questionLists = await Promise.all(
    exams.map((e) => listDkQuestions(e.exam_id).catch(() => [])),
  )
  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i]
    out.push({
      url: `${BASE}/dk/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    for (const q of questionLists[i]) {
      out.push({
        url: `${BASE}/dk/play/${exam.exam_id}/q/${q.q_number}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }
  return out
}

async function takkenPartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = [
    { url: `${BASE}/takken`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/takken/exams`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/takken/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ]
  const exams = await TakkenAPI.listExams().catch(() => [])
  const wrappedLists = await Promise.all(
    exams.map((e) => TakkenAPI.listExamQuestions(e.exam_id)),
  )
  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i]
    out.push({
      url: `${BASE}/takken/exams/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    const wrapped = wrappedLists[i]
    if (wrapped) {
      for (const q of wrapped.questions) {
        if (q.question_number === 1) continue
        out.push({
          url: `${BASE}/takken/exams/${exam.exam_id}/quiz?q=${q.question_number}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      }
    }
  }
  for (const cat of ["権利関係", "宅建業法", "法令上の制限", "税その他"]) {
    out.push({
      url: `${BASE}/takken/categories/${encodeURIComponent(cat)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  }
  return out
}

async function knPartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = [
    { url: `${BASE}/kango`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/kango/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/kango/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ]
  const exams = await listKnExams().catch(() => [])
  for (const e of exams) {
    out.push({
      url: `${BASE}/kango/exam/${e.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  }
  // カテゴリ (出題基準の19分野)
  for (const c of KANGO_CATEGORIES) {
    out.push({
      url: `${BASE}/kango/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  }
  const all = await listAllKnQuestions().catch(() => [])
  // 個別問題ページ (SEO: 1問=1URL)。fe/ip/ap/sg と同形 /kango/play/{examId}/q/{qNumber}
  for (const q of all) {
    out.push({
      url: `${BASE}/kango/play/${q.exam_id}/q/${q.q_number}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }
  return out
}

async function glossaryPartition(): Promise<MetadataRoute.Sitemap> {
  const { listAllTerms, termToSlug } = await import("@/lib/seo/glossary")
  const now = new Date()
  return listAllTerms().map((e) => ({
    url: `${BASE}/glossary/${termToSlug(e.term)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }))
}
