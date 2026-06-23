import type {
  Choice,
  ChoiceExplanation,
  ChoiceLabel,
  Explanation,
  Question,
} from "./types"

/**
 * Returns a copy of the question with choice contents shuffled. The display
 * labels (ア, イ, ウ, エ) stay in their original position; `correct_label`
 * and `explanation.per_choice` are remapped so the answer key follows the
 * moved text.
 */
export function withShuffledChoices(q: Question): Question {
  return withShuffledChoicesAndMap(q).question
}

export type ShuffleResult = {
  question: Question
  /**
   * 表示ラベル → シャッフル前 (DB 上) のラベル の対応。stats など外部から
   * 渡される label-keyed データを表示ラベル空間へ remap するときに使う。
   */
  displayedToOriginal: Record<string, string>
}

/**
 * Same as `withShuffledChoices` but additionally returns the displayed→original
 * label mapping. Use this when external label-keyed data (e.g. stats) must be
 * remapped to align with the shuffled display order.
 */
export function withShuffledChoicesAndMap(q: Question): ShuffleResult {
  if (
    q.choices.length < 2 ||
    q.shuffle_choices === false ||
    q.figures?.some((f) => f.role === "choices")
  ) {
    const identity: Record<string, string> = {}
    for (const c of q.choices) identity[c.label] = c.label
    return { question: q, displayedToOriginal: identity }
  }

  const n = q.choices.length
  const indices = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const newChoices: Choice[] = q.choices.map((c, k) => ({
    label: c.label,
    text: q.choices[indices[k]].text,
  }))

  const oldLabelToNewLabel = new Map<ChoiceLabel, ChoiceLabel>()
  indices.forEach((oldIdx, newPos) => {
    oldLabelToNewLabel.set(q.choices[oldIdx].label, q.choices[newPos].label)
  })

  const newCorrectLabel = q.correct_label
    ? oldLabelToNewLabel.get(q.correct_label) ?? q.correct_label
    : q.correct_label

  let newExplanation: Explanation | undefined = q.explanation
  if (q.explanation?.per_choice) {
    const remapped: ChoiceExplanation[] = []
    for (const item of q.explanation.per_choice) {
      const newLabel = oldLabelToNewLabel.get(item.label)
      if (!newLabel) continue
      remapped.push({ label: newLabel, text: item.text })
    }
    newExplanation = { overall: q.explanation.overall, per_choice: remapped }
  }

  const displayedToOriginal: Record<string, string> = {}
  indices.forEach((oldIdx, newPos) => {
    const displayed = q.choices[newPos].label
    const original = q.choices[oldIdx].label
    displayedToOriginal[displayed] = original
  })

  return {
    question: {
      ...q,
      choices: newChoices,
      correct_label: newCorrectLabel,
      explanation: newExplanation,
    },
    displayedToOriginal,
  }
}

/**
 * Strips trailing sentences that hard-code a choice label as the answer
 * (e.g. "よってイが正解です。"). Required because choices are reshuffled at
 * display time and any baked-in label callout is wrong.
 */
export function stripAnswerReferenceTail(text: string): string {
  const parts = text.split("。")
  while (parts.length > 0 && parts[parts.length - 1].trim() === "") {
    parts.pop()
  }
  const refPattern = /[ア-エ]が(?:正解|適切|正しい|該当)|正解は[ア-エ]/
  while (parts.length > 0) {
    const last = parts[parts.length - 1].trim()
    if (refPattern.test(last) && last.length <= 40) {
      parts.pop()
    } else {
      break
    }
  }
  if (parts.length === 0) return ""
  return parts.join("。") + "。"
}
