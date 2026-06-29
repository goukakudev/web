import type { ExamSummary, Question } from "@/lib/types"
import { listAllTerms } from "@/lib/seo/glossary"
import { stripMd } from "@/lib/text-utils"

export type SeoQuestionSubject = "ip" | "fe" | "sg"

export interface SeoQuestionSubjectConfig {
  subject: SeoQuestionSubject
  fullName: string
  shortName: string
  questionsPath: string
  examPath: string
  playPath: string
  credentialName: string
}

export const SEO_QUESTION_SUBJECTS: Record<SeoQuestionSubject, SeoQuestionSubjectConfig> = {
  ip: {
    subject: "ip",
    fullName: "ITパスポート試験",
    shortName: "ITパスポート",
    questionsPath: "/ip/questions",
    examPath: "/ip/exam",
    playPath: "/ip/play",
    credentialName: "ITパスポート",
  },
  fe: {
    subject: "fe",
    fullName: "基本情報技術者試験",
    shortName: "基本情報技術者",
    questionsPath: "/fe/questions",
    examPath: "/fe/exam",
    playPath: "/fe/play",
    credentialName: "基本情報技術者",
  },
  sg: {
    subject: "sg",
    fullName: "情報セキュリティマネジメント試験",
    shortName: "情報セキュリティマネジメント",
    questionsPath: "/sg/questions",
    examPath: "/sg/exam",
    playPath: "/sg/play",
    credentialName: "情報セキュリティマネジメント",
  },
}

const BROAD_TAGS = new Set([
  "ストラテジ系",
  "マネジメント系",
  "テクノロジ系",
  "法務",
  "セキュリティ",
  "ネットワーク",
  "データベース",
  "アルゴリズム",
  "データ構造",
  "AI",
  "DX",
])

export function isBroadQuestionTag(tag: string): boolean {
  return BROAD_TAGS.has(tag.replace(/^#/, "").trim())
}

const TOPIC_SLUGS: Record<string, string> = {
  "2分探索木": "binary-search-tree",
  BCP: "bcp",
  DX: "dx",
  AI: "ai",
  "ISO/IEC 27017": "iso-iec-27017",
  "JIS Q 31000": "jis-q-31000",
  PKI: "pki",
  RPA: "rpa",
  SIEM: "siem",
  SLA: "sla",
  SWOT分析: "swot-analysis",
  "SWOT": "swot",
  オープンデータ: "open-data",
  クラウドセキュリティ: "cloud-security",
  ゼロトラスト: "zero-trust",
  データベース: "database",
  ネットワーク: "network",
  ファインチューニング: "fine-tuning",
  プロジェクトマネジメント: "project-management",
  リスクマネジメント: "risk-management",
  丸め誤差: "rounding-error",
  共通鍵暗号方式: "symmetric-key-cryptography",
  労働者派遣: "worker-dispatch",
  労働者派遣法: "worker-dispatch-law",
  官民データ活用推進基本法: "public-private-data-act",
  機械学習: "machine-learning",
  偽装請負: "gisou-ukeoi",
  請負契約: "ukeoi-contract",
  損益分岐点: "break-even-point",
  正規化: "normalization",
  情報セキュリティ: "information-security",
}

export function examSlugPart(subject: SeoQuestionSubject, examId: string): string {
  const withoutSubject = examId.startsWith(`${subject}-`)
    ? examId.slice(subject.length + 1)
    : examId
  return withoutSubject.replace(/^(\d{4})([a-z]\d{2}.*)$/i, "$1-$2")
}

export function formatExamLabel(exam: ExamSummary, subject: SeoQuestionSubject): string {
  const fullName = SEO_QUESTION_SUBJECTS[subject].fullName
  let label = exam.title ?? `${exam.year} ${exam.section}`.trim()
  for (const prefix of [fullName, "IT パスポート試験", "ITパスポート"]) {
    if (label.startsWith(prefix)) label = label.slice(prefix.length).trim()
  }
  label = label
    .replace(/\s*公開問題$/, "")
    .replace(/\s*サンプル問題$/, "")
    .trim()
  return label || exam.exam_id
}

export function pickQuestionTopic(question: Question): string {
  const body = stripMd(question.body)
  const explain = question.explanation?.overall ? stripMd(question.explanation.overall) : ""
  const haystack = `${body} ${explain}`
  const tags = (question.tags ?? [])
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter(Boolean)

  const exact = tags.find((tag) => !BROAD_TAGS.has(tag) && haystack.includes(tag))
  if (exact) return exact

  const glossaryMatch = listAllTerms()
    .filter((entry) => !BROAD_TAGS.has(entry.term) && haystack.includes(entry.term))
    .sort((a, b) => b.term.length - a.term.length)[0]
  if (glossaryMatch) return glossaryMatch.term

  const pattern =
    /([A-Za-z0-9][A-Za-z0-9/ .:+-]{1,42}|[ぁ-んァ-ヶー一-龥A-Za-z0-9/・（）()：:+-]{2,42})(?:に関する|の説明|とは|として|による|における|とみなされる)/gu
  for (const match of body.matchAll(pattern)) {
    const raw = match[1] ?? ""
    const candidate = raw.split(/[，,。]/).pop()?.trim() ?? ""
    if (candidate.length >= 2 && candidate.length <= 32) {
      return candidate.replace(/[「」"“”]/g, "")
    }
  }

  const specific = tags.find((tag) => !BROAD_TAGS.has(tag))
  return specific ?? tags[0] ?? "過去問"
}

export function topicSlug(topic: string): string {
  const normalized = topic
    .replace(/[「」"“”]/g, "")
    .replace(/２/g, "2")
    .trim()
  const direct = TOPIC_SLUGS[normalized]
  if (direct) return direct

  const ascii = normalized
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return ascii || "kaisetsu"
}

export function questionSlug(
  subject: SeoQuestionSubject,
  exam: ExamSummary,
  question: Question,
): string {
  return `${examSlugPart(subject, exam.exam_id)}-q${question.q_number}-${topicSlug(
    pickQuestionTopic(question),
  )}`
}

export function questionCanonicalPath(
  subject: SeoQuestionSubject,
  exam: ExamSummary,
  question: Question,
): string {
  return `${SEO_QUESTION_SUBJECTS[subject].questionsPath}/${questionSlug(
    subject,
    exam,
    question,
  )}`
}

export function questionPlayPath(
  subject: SeoQuestionSubject,
  examId: string,
  qNumber: number,
): string {
  return `${SEO_QUESTION_SUBJECTS[subject].playPath}/${examId}/q/${qNumber}`
}

export function parseQuestionSlug(
  subject: SeoQuestionSubject,
  slug: string,
  exams: ExamSummary[],
): { exam: ExamSummary; qNumber: number } | null {
  const match = /^(.*)-q(\d+)(?:-.+)?$/.exec(slug)
  if (!match) return null
  const examPart = match[1]
  const qNumber = Number(match[2])
  if (!Number.isInteger(qNumber) || qNumber < 1) return null
  const exam = exams.find((e) => examSlugPart(subject, e.exam_id) === examPart)
  return exam ? { exam, qNumber } : null
}

export function questionSeoTitle(
  subject: SeoQuestionSubject,
  exam: ExamSummary,
  question: Question,
): string {
  const topic = pickQuestionTopic(question)
  const examLabel = formatExamLabel(exam, subject)
  return `${topic}とは？${SEO_QUESTION_SUBJECTS[subject].fullName} ${examLabel} 問${question.q_number}を解説`
}

export function questionSeoDescription(
  subject: SeoQuestionSubject,
  exam: ExamSummary,
  question: Question,
): string {
  const topic = pickQuestionTopic(question)
  const examLabel = formatExamLabel(exam, subject)
  return `${topic}が問われた${SEO_QUESTION_SUBJECTS[subject].fullName} ${examLabel} 問${question.q_number}の解説。問題文、選択肢、正解、なぜ他の選択肢が違うかを確認できます。`
}
