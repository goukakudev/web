import type { ExamSummary, Question } from "@/lib/types"
import { findByTerm } from "@/lib/seo/glossary"
import {
  isBroadQuestionTag,
  pickQuestionTopic,
  questionCanonicalPath,
  type SeoQuestionSubject,
} from "@/lib/seo/question-url"
import { stripMd } from "@/lib/text-utils"

export interface RelatedQuestionLink {
  question: Question
  reason: "same_term" | "same_field" | "nearby"
  label: string
  score: number
}

export function normalizedQuestionTags(question: Question): string[] {
  return (question.tags ?? [])
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter(Boolean)
}

export function specificQuestionTags(question: Question): string[] {
  return normalizedQuestionTags(question).filter((tag) => !isBroadQuestionTag(tag))
}

export function broadQuestionTags(question: Question): string[] {
  return normalizedQuestionTags(question).filter((tag) => isBroadQuestionTag(tag))
}

export function questionSearchText(question: Question): string {
  return stripMd(
    [
      question.body,
      ...question.choices.map((choice) => choice.text),
      question.explanation?.overall ?? "",
      ...(question.explanation?.per_choice ?? []).map((choice) => choice.text),
    ].join(" "),
  )
}

export function questionContainsTerm(question: Question, term: string): boolean {
  if (specificQuestionTags(question).includes(term)) return true
  return questionSearchText(question).includes(term)
}

export function relatedGlossaryTerms(question: Question, limit = 8) {
  const text = questionSearchText(question)
  const tags = specificQuestionTags(question)
  const byTerm = new Map<string, NonNullable<ReturnType<typeof findByTerm>>>()
  for (const tag of tags) {
    const entry = findByTerm(tag)
    if (entry) byTerm.set(entry.term, entry)
  }
  for (const tag of tags) {
    for (const fragment of tag.split(/[・/／\s]+/)) {
      if (!fragment) continue
      const entry = findByTerm(fragment)
      if (entry) byTerm.set(entry.term, entry)
    }
  }
  for (const entry of Array.from(byTerm.values())) {
    if (text.includes(entry.term)) byTerm.set(entry.term, entry)
  }
  return Array.from(byTerm.values()).slice(0, limit)
}

export function relatedQuestionLinks(
  subject: SeoQuestionSubject,
  exam: ExamSummary,
  question: Question,
  examQuestions: Question[],
  limit = 5,
): RelatedQuestionLink[] {
  const topic = pickQuestionTopic(question)
  const specificTags = new Set(specificQuestionTags(question))
  const broadTags = new Set(broadQuestionTags(question))
  const candidates = examQuestions
    .filter((candidate) => candidate.q_number !== question.q_number)
    .map((candidate): RelatedQuestionLink | null => {
      const candidateSpecific = specificQuestionTags(candidate)
      const exactTag = candidateSpecific.find((tag) => specificTags.has(tag))
      if (exactTag) {
        return {
          question: candidate,
          reason: "same_term",
          label: `同じ用語: ${exactTag}`,
          score: 120 - Math.abs(candidate.q_number - question.q_number),
        }
      }

      if (topic !== "過去問" && questionContainsTerm(candidate, topic)) {
        return {
          question: candidate,
          reason: "same_term",
          label: `同じテーマ: ${topic}`,
          score: 100 - Math.abs(candidate.q_number - question.q_number),
        }
      }

      const candidateBroad = broadQuestionTags(candidate)
      const broad = candidateBroad.find((tag) => broadTags.has(tag))
      if (broad) {
        return {
          question: candidate,
          reason: "same_field",
          label: `同じ分野: ${broad}`,
          score: 30 - Math.abs(candidate.q_number - question.q_number) / 10,
        }
      }

      return null
    })
    .filter((item): item is RelatedQuestionLink => Boolean(item))

  return candidates
    .sort((a, b) => {
      const byScore = b.score - a.score
      if (byScore !== 0) return byScore
      const aPath = questionCanonicalPath(subject, exam, a.question)
      const bPath = questionCanonicalPath(subject, exam, b.question)
      return a.question.q_number - b.question.q_number || aPath.localeCompare(bPath)
    })
    .slice(0, limit)
}
