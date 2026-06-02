import type {
  ExamSummary,
  PopularTag,
  Question,
  QuestionListResponse,
} from "@/lib/types"
import {
  listApExams,
  listApQuestions,
  listExams,
  listIpExams,
  listIpQuestions,
  listQuestions,
  listSgExams,
  listSgQuestions,
} from "@/lib/api-client"

export type TagSubject = "fe" | "ip" | "ap" | "sg"

export interface TagPageData {
  questions: Question[]
  examsById: Map<string, ExamSummary>
  relatedTags: PopularTag[]
  exams: ExamSummary[]
}

const listers: Record<
  TagSubject,
  {
    listExams: () => Promise<ExamSummary[]>
    listQuestions: (examId: string) => Promise<Question[] | QuestionListResponse["questions"]>
  }
> = {
  fe: { listExams: listExams, listQuestions: listQuestions },
  ip: { listExams: listIpExams, listQuestions: listIpQuestions },
  ap: { listExams: listApExams, listQuestions: listApQuestions },
  sg: { listExams: listSgExams, listQuestions: listSgQuestions },
}

export async function fetchTagPageData(
  subject: TagSubject,
  tag: string,
): Promise<TagPageData> {
  const api = listers[subject]
  const exams = await api.listExams()
  const examsById = new Map<string, ExamSummary>(exams.map((e) => [e.exam_id, e]))

  const matched: Question[] = []
  const coTagCount = new Map<string, number>()
  // Parallelize per-exam fetches; api-client caches each one independently.
  const questionLists = await Promise.all(
    exams.map((e) =>
      (api.listQuestions(e.exam_id) as Promise<Question[]>).catch(
        () => [] as Question[],
      ),
    ),
  )
  for (const qs of questionLists) {
    for (const q of qs) {
      if (!(q.tags ?? []).includes(tag)) continue
      matched.push(q)
      for (const t of q.tags ?? []) {
        if (t && t !== tag) {
          coTagCount.set(t, (coTagCount.get(t) ?? 0) + 1)
        }
      }
    }
  }
  matched.sort((a, b) => {
    if (a.exam_id !== b.exam_id) return a.exam_id < b.exam_id ? -1 : 1
    return a.q_number - b.q_number
  })

  const relatedTags: PopularTag[] = [...coTagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([t, count]) => ({ tag: t, count }))

  return { questions: matched, examsById, relatedTags, exams }
}

export function buildTagIntro({
  subject,
  display,
  count,
}: {
  subject: TagSubject
  display: string
  count: number
}): string {
  const full =
    subject === "fe"
      ? "基本情報技術者試験"
      : subject === "ap"
        ? "応用情報技術者試験"
        : subject === "sg"
          ? "情報セキュリティマネジメント試験"
          : "ITパスポート試験"
  return (
    `${full}の過去問のうち、「${display}」のタグが付いた問題 ${count} 問の一覧です。` +
    `年度をまたいで「${display}」関連の出題傾向を俯瞰でき、苦手分野の集中演習に使えます。` +
    `各問題には解説と選択肢ごとの正誤判定が付いており、関連タグから別分野へ横断的に学習を広げられます。`
  )
}
