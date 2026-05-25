import type { MetadataRoute } from "next"
import {
  listExams,
  listQuestions,
  listIpExams,
  listIpQuestions,
} from "@/lib/api-client"
import { TakkenAPI } from "@/lib/takken/api"
import { tagToSlug } from "@/lib/tag-url"

const BASE = "https://goukaku.dev"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [root, fe, ip, takken, glossary] = await Promise.all([
    Promise.resolve(rootPartition()),
    fePartition(),
    ipPartition(),
    takkenPartition(),
    glossaryPartition(),
  ])
  return [...root, ...fe, ...ip, ...takken, ...glossary]
}

function rootPartition(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/fe`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/ip`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/takken`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/fe/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ip/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/takken/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/fe/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/ip/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
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
  const tagSet = new Set<string>()
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
      for (const t of q.tags ?? []) if (t) tagSet.add(t)
    }
  }
  for (const tag of [...tagSet].sort()) {
    out.push({
      url: `${BASE}/fe/tag/${tagToSlug(tag)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    })
  }
  const yearSet = new Set<string>()
  for (const e of exams) if (e.year) yearSet.add(e.year)
  for (const y of [...yearSet].sort()) {
    out.push({
      url: `${BASE}/fe/year/${encodeURIComponent(y)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    })
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
  const tagSet = new Set<string>()
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
      for (const t of q.tags ?? []) if (t) tagSet.add(t)
    }
  }
  for (const tag of [...tagSet].sort()) {
    out.push({
      url: `${BASE}/ip/tag/${tagToSlug(tag)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    })
  }
  const yearSet = new Set<string>()
  for (const e of exams) if (e.year) yearSet.add(e.year)
  for (const y of [...yearSet].sort()) {
    out.push({
      url: `${BASE}/ip/year/${encodeURIComponent(y)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    })
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
  const yearSet = new Set<number>()
  for (const e of exams) yearSet.add(e.year)
  for (const y of [...yearSet].sort((a, b) => b - a)) {
    out.push({
      url: `${BASE}/takken/year/${y}`,
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
