export type ChoiceLabel = "ア" | "イ" | "ウ" | "エ"

export interface Choice {
  label: ChoiceLabel
  text: string
}

export interface FigureRef {
  id: string
  r2_key: string
  url: string
  alt?: string
  source_page: number
}

export interface ChoiceExplanation {
  label: ChoiceLabel
  text: string
}

export interface Explanation {
  overall: string
  per_choice?: ChoiceExplanation[]
}

export interface Question {
  _id: string
  kind: string
  exam_id: string
  q_number: number
  source_page?: number
  body: string
  choices: Choice[]
  correct_label?: ChoiceLabel
  figures?: FigureRef[]
  explanation?: Explanation
  tags?: string[]
  related_qids?: string[]
  hint?: string
}

export interface ExamSummary {
  exam_id: string
  exam: string
  year: string
  section: string
  title?: string
  question_count: number
}

export interface ExamListResponse {
  exams: ExamSummary[]
}

export interface QuestionListResponse {
  exam_id: string
  count: number
  questions: Question[]
}

export interface PopularTag {
  tag: string
  count: number
}

export interface PopularTagListResponse {
  tags: PopularTag[]
}

export interface WeakTag {
  tag: string
  answered: number
  correct: number
  accuracy_percent: number
}

export interface WeakTagListResponse {
  tags: WeakTag[]
}
