// 看護師国家試験 (KN_DB /v1/kn) の型。iOS kango アプリ Question.swift を TS へ移植。
// IPA(ア/イ/ウ/エ・単一)とは別スキーマ: 数字ラベル1-5・複数選択・計算・組合せ・図・採点除外。

export type AnswerType = "single" | "multiple" | "numeric"

export interface KangoChoice {
  label: string // "1".."5"
  text: string
  pair?: string[] // 組合せ問題: [左, 右]
}

export interface KangoFigure {
  id?: string
  url?: string | null
  r2_key?: string | null
  alt?: string | null
  for_label?: string | null // 選択肢に紐づく図 (Q63 等)
  source_page?: number | null
}

export interface KangoScenario {
  range?: string | null // "91-93"
  text: string
}

export interface KangoChoiceExplanation {
  label: string
  text: string
}

export interface KangoExplanation {
  overall: string
  per_choice?: KangoChoiceExplanation[]
}

/** correct は API 上 string / string[] / number / null と多態。 */
export type KangoCorrect = string | string[] | number | null

export interface KangoQuestion {
  _id: string
  exam_id: string
  q_number: number
  answer_type: AnswerType
  body: string
  choices?: KangoChoice[]
  choice_count?: number
  correct: KangoCorrect
  figures?: KangoFigure[]
  scenario?: KangoScenario | null
  format?: string | null // "matching"
  unit?: string | null // 計算問題の単位
  excluded?: boolean
  multiple_correct_accepted?: boolean
  has_figure?: boolean
  choices_in_figure?: boolean
  source_page?: number
  explanation?: KangoExplanation | null
  category?: string // 出題基準の分野 slug (lib/kango/categories.ts)
  tags?: string[] // "#" 付きトピック
}

export interface KangoExamSummary {
  exam_id: string
  name: string
  session?: string | null // "午前" / "午後"
  session_code?: string | null
  held_on?: string | null
  question_count: number
}

export interface KangoExamListResponse {
  exams: KangoExamSummary[]
}

export interface KangoQuestionListResponse {
  exam_id: string
  count: number
  questions: KangoQuestion[]
}
