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

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
}

export default async function sitemap({
  id,
}: {
  id: number | Promise<number>
}): Promise<MetadataRoute.Sitemap> {
  // Next.js 16 passes `id` as a Promise; await defensively for both shapes.
  const resolved = await Promise.resolve(id)
  const n = typeof resolved === "string" ? Number(resolved) : resolved
  switch (n) {
    case 0:
      return rootPartition()
    case 1:
      return fePartition()
    case 2:
      return ipPartition()
    case 3:
      return takkenPartition()
    case 4:
      return glossaryPartition()
    default:
      return []
  }
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
  for (const exam of exams) {
    out.push({
      url: `${BASE}/fe/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    try {
      const questions = await listQuestions(exam.exam_id)
      for (const q of questions) {
        out.push({
          url: `${BASE}/fe/play/${exam.exam_id}/q/${q.q_number}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        })
        for (const t of q.tags ?? []) if (t) tagSet.add(t)
      }
    } catch {
      // skip
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
  for (const exam of exams) {
    out.push({
      url: `${BASE}/ip/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    try {
      const questions = await listIpQuestions(exam.exam_id)
      for (const q of questions) {
        out.push({
          url: `${BASE}/ip/play/${exam.exam_id}/q/${q.q_number}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        })
        for (const t of q.tags ?? []) if (t) tagSet.add(t)
      }
    } catch {
      // skip
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
  for (const exam of exams) {
    out.push({
      url: `${BASE}/takken/exams/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    const wrapped = await TakkenAPI.listExamQuestions(exam.exam_id)
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
