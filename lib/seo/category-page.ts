import type { ExamSummary, PopularTag, Question } from "@/lib/types"
import {
  listExams,
  listIpExams,
  listIpQuestions,
  listQuestions,
} from "@/lib/api-client"
import type { CategoryMeta } from "./category-meta/fe"

export type CategorySubject = "fe" | "ip"

export interface CategoryPageData {
  matchedTags: PopularTag[]
  sampleQuestions: { q: Question; exam: ExamSummary | undefined }[]
  totalMatched: number
}

const listers: Record<CategorySubject, {
  listExams: () => Promise<ExamSummary[]>
  listQuestions: (id: string) => Promise<Question[]>
}> = {
  fe: { listExams: listExams, listQuestions: listQuestions },
  ip: { listExams: listIpExams, listQuestions: listIpQuestions },
}

export async function fetchCategoryPageData(
  subject: CategorySubject,
  meta: CategoryMeta,
): Promise<CategoryPageData> {
  const api = listers[subject]
  const exams = await api.listExams().catch(() => [])
  const examsById = new Map(exams.map((e) => [e.exam_id, e]))
  const tagCount = new Map<string, number>()
  const sampleByTag = new Map<string, { q: Question; exam: ExamSummary | undefined }>()

  // Fetch all exams' question lists in parallel; each call is independently cached
  // by the upstream API client (revalidate = 24h), so parallelism just reduces
  // wall-clock build time.
  const questionLists = await Promise.all(
    exams.map((e) =>
      api.listQuestions(e.exam_id).catch(() => [] as Question[]),
    ),
  )
  for (const qs of questionLists) {
    for (const q of qs) {
      for (const t of q.tags ?? []) {
        const matches = meta.tagKeywords.some((kw) => t.includes(kw))
        if (!matches) continue
        tagCount.set(t, (tagCount.get(t) ?? 0) + 1)
        if (!sampleByTag.has(t)) {
          sampleByTag.set(t, { q, exam: examsById.get(q.exam_id) })
        }
      }
    }
  }

  const matchedTags: PopularTag[] = [...tagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }))
  const totalMatched = matchedTags.reduce((s, t) => s + t.count, 0)
  const sampleQuestions = matchedTags
    .slice(0, 10)
    .map((mt) => sampleByTag.get(mt.tag))
    .filter((x): x is { q: Question; exam: ExamSummary | undefined } => Boolean(x))

  return { matchedTags, sampleQuestions, totalMatched }
}
