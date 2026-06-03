// 看護データの採点・表示ヘルパー。iOS Question.swift / Exam.swift のロジックを移植。
import type { KangoCorrect, KangoQuestion, KangoExamSummary } from "./types"

/** correct を文字列ラベル配列へ正規化。 */
export function correctLabels(c: KangoCorrect): string[] {
  if (c == null) return []
  if (Array.isArray(c)) return c.map(String)
  return [String(c)]
}

/** 表示用の正答テキスト (例 "2" / "1・4" / "42")。 */
export function correctDisplay(c: KangoCorrect): string {
  const ls = correctLabels(c)
  return ls.length ? ls.join("・") : "—"
}

/** 採点除外 (正答なし or excluded)。正誤を判定しない。 */
export function isUnscored(q: KangoQuestion): boolean {
  return q.excluded === true || correctLabels(q.correct).length === 0
}

/** 複数選択なら必要選択数(=正答数)、それ以外1。 */
export function requiredSelections(q: KangoQuestion): number {
  if (q.answer_type === "multiple") {
    return Math.max(2, correctLabels(q.correct).length || 2)
  }
  return 1
}

/** 選択(複数可)が正答と一致するか。iOS Question.isCorrect を移植。 */
export function gradeAnswer(q: KangoQuestion, selected: string[]): boolean {
  if (isUnscored(q)) return false
  const correct = correctLabels(q.correct)
  if (q.answer_type === "multiple") {
    if (selected.length !== correct.length) return false
    const s = new Set(selected)
    return correct.every((l) => s.has(l))
  }
  // single (複数正解救済を含む): いずれか1つが正答集合に入っていれば正解
  if (selected.length !== 1) return false
  return correct.includes(selected[0])
}

export function isMatching(q: KangoQuestion): boolean {
  return q.format === "matching"
}

/** 出題形式の短いタグ (状況設定 / 組合せ / 計算 / 複数選択)。 */
export function formatTag(q: KangoQuestion): string | null {
  if (q.scenario) return "状況設定"
  if (isMatching(q)) return "組合せ"
  if (q.answer_type === "numeric") return "計算"
  if (q.answer_type === "multiple") return "2つ選べ"
  return null
}

export type ExamType = "看護師" | "助産師" | "保健師" | "その他"

/** exam_id 接頭辞 → 試験種別。 */
export function examType(examId: string): ExamType {
  if (examId.startsWith("kango")) return "看護師"
  if (examId.startsWith("josan")) return "助産師"
  if (examId.startsWith("hoken")) return "保健師"
  return "その他"
}

/** "kango-115-am" → 115 (最初の数値要素)。 */
export function roundNumber(examId: string): number {
  for (const p of examId.split("-")) {
    const n = parseInt(p, 10)
    if (!Number.isNaN(n)) return n
  }
  return 0
}

/** 例: "第115回 午前"。 */
export function shortLabel(e: KangoExamSummary): string {
  return `第${roundNumber(e.exam_id)}回${e.session ? " " + e.session : ""}`
}

/** 例: "第115回 看護師国家試験（午前）"。 */
export function displayTitle(e: KangoExamSummary): string {
  return e.session ? `${e.name}（${e.session}）` : e.name
}

/** 試験種別 → アクセント色 (CSS 値)。 */
export function typeColor(examId: string): string {
  switch (examType(examId)) {
    case "看護師":
      return "var(--color-kn-blue-600)"
    case "助産師":
      return "#ec4899"
    case "保健師":
      return "var(--color-kn-success)"
    default:
      return "var(--color-kn-text-2)"
  }
}

/** exam_id だけからラベルを組み立てる (記録/お気に入り画面用。exam メタ無しで使う)。 */
export function examLabelFromId(examId: string): string {
  const s = examId.endsWith("-am") ? "午前" : examId.endsWith("-pm") ? "午後" : ""
  return `${examType(examId)} 第${roundNumber(examId)}回${s ? " " + s : ""}`
}

/** 問題 _id ("kango-115-am-Q077") から exam_id ("kango-115-am") を取り出す。 */
export function examIdFromQuestionId(questionId: string): string {
  return questionId.replace(/-Q\d+.*$/, "")
}

/** 試験種別→回(降順)でグループ化 (試験ピッカー用)。 */
export function groupExams(
  exams: KangoExamSummary[],
): { type: ExamType; exams: KangoExamSummary[] }[] {
  const order: ExamType[] = ["看護師", "助産師", "保健師", "その他"]
  const byType = new Map<ExamType, KangoExamSummary[]>()
  for (const e of exams) {
    const t = examType(e.exam_id)
    const arr = byType.get(t) ?? []
    arr.push(e)
    byType.set(t, arr)
  }
  return order
    .filter((t) => (byType.get(t)?.length ?? 0) > 0)
    .map((t) => ({
      type: t,
      exams: byType.get(t)!.slice().sort((a, b) => {
        const d = roundNumber(b.exam_id) - roundNumber(a.exam_id)
        return d !== 0 ? d : (a.session ?? "").localeCompare(b.session ?? "")
      }),
    }))
}
