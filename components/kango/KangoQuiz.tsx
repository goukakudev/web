"use client"
// クイズ本体 (フォーカスモード)。iOS QuizScreen.swift を移植。
// 数字ラベル / 単一(1タップ即解答) / 複数選択 / 計算(numeric) / 組合せ / 図 / 解説 / 採点除外。
// 横スワイプは指追従カルーセル: 隣の問題が見えながら指について動き、離すとスナップ／途中なら戻る。
import { useState, useEffect, useRef, type ReactNode } from "react"
import Link from "next/link"
import type { KangoQuestion, KangoExamSummary, KangoFigure, KangoGlossaryTerm } from "@/lib/kango/types"
import {
  correctLabels,
  correctDisplay,
  isUnscored,
  requiredSelections,
  gradeAnswer,
  formatTag,
} from "@/lib/kango/exam"
import { recordKangoAnswer, isKangoBookmarked, toggleKangoBookmark } from "@/lib/kango/store"
import { categoryBySlug } from "@/lib/kango/categories"
import { tagToSlug } from "@/lib/tag-url"
import { Chip, ProgressBar } from "./ui"

interface QState {
  selected: string[]
  revealed: boolean
  numericText: string
}

function shuffleArr<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

// 本文を glossary の用語境界で分割し、用語に点線下線+クリック(用語シート)を付ける。
// 最長一致・前方優先。glossary が無ければ素の文字列をそのまま返す。
function renderBody(
  body: string,
  glossary: KangoGlossaryTerm[] | undefined,
  onTerm: (t: KangoGlossaryTerm) => void,
): ReactNode {
  if (!glossary || glossary.length === 0) return body
  const terms = [...glossary].sort((a, b) => Array.from(b.term).length - Array.from(a.term).length)
  const out: ReactNode[] = []
  const chars = Array.from(body)
  let plain = ""
  let key = 0
  const flush = () => {
    if (plain) {
      out.push(<span key={`p${key++}`}>{plain}</span>)
      plain = ""
    }
  }
  let i = 0
  while (i < chars.length) {
    let matched: KangoGlossaryTerm | undefined
    for (const t of terms) {
      const tc = Array.from(t.term)
      if (tc.length > 0 && i + tc.length <= chars.length && chars.slice(i, i + tc.length).join("") === t.term) {
        matched = t
        break
      }
    }
    if (matched) {
      flush()
      const tm = matched
      out.push(
        <button
          key={`t${key++}`}
          type="button"
          onClick={() => onTerm(tm)}
          style={{
            display: "inline",
            font: "inherit",
            padding: 0,
            margin: 0,
            border: "none",
            background: "none",
            color: "var(--color-kn-primary)",
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            textUnderlineOffset: 3,
            verticalAlign: "baseline",
            cursor: "pointer",
          }}
        >
          {tm.term}
        </button>,
      )
      i += Array.from(tm.term).length
    } else {
      plain += chars[i]
      i += 1
    }
  }
  flush()
  return out
}

/** 経過時間チップ。1秒ごとの再描画をこの小コンポーネントに閉じ込める (iOS ElapsedChip 相当)。 */
function ElapsedChip() {
  const [sec, setSec] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const mm = String(Math.floor(sec / 60)).padStart(2, "0")
  const ss = String(sec % 60).padStart(2, "0")
  return (
    <Chip tone="plain">
      <span aria-hidden>🕐</span>
      {mm}:{ss}
    </Chip>
  )
}

export function KangoQuiz({
  questions: initial,
  exam,
  title,
  backHref,
  startIndex = 0,
  shuffle = false,
  limit,
}: {
  questions: KangoQuestion[]
  exam: KangoExamSummary | null
  title: string
  backHref: string
  startIndex?: number
  shuffle?: boolean
  limit?: number
}) {
  const [questions, setQuestions] = useState(initial)
  const [idx, setIdx] = useState(Math.min(startIndex, Math.max(0, initial.length - 1)))
  const [states, setStates] = useState<QState[]>(() =>
    initial.map(() => ({ selected: [], revealed: false, numericText: "" })),
  )
  const [bookmarked, setBookmarked] = useState(false)
  const [zoomFig, setZoomFig] = useState<KangoFigure | null>(null)
  const [term, setTerm] = useState<KangoGlossaryTerm | null>(null)

  // 指追従カルーセル用の状態。drag=指で動かしている px、dragging 中は transition を切る。
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const gesture = useRef<{ x: number; y: number; dir: "h" | "v" | null; w: number } | null>(null)
  const dragRef = useRef(0)
  const viewportRef = useRef<HTMLDivElement>(null)

  // ランダムはマウント後に1度だけシャッフル (SSR との hydration mismatch を避ける)。
  // 全問シャッフル→先頭 limit 件に絞り、states も作り直す。
  useEffect(() => {
    if (shuffle) {
      const sh = shuffleArr(initial).slice(0, limit ?? initial.length)
      setQuestions(sh)
      setStates(sh.map(() => ({ selected: [], revealed: false, numericText: "" })))
      setIdx(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const count = questions.length
  const q = questions[idx]
  const st = states[idx]

  useEffect(() => {
    if (q) setBookmarked(isKangoBookmarked(q._id))
  }, [q])

  // 用語シートは Escape でも閉じる。
  useEffect(() => {
    if (!term) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTerm(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [term])

  if (!q || !st) {
    return (
      <main style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--color-kn-text-2)" }}>問題がありません</p>
      </main>
    )
  }

  // --- 各問の状態を index 指定で操作（カルーセルの各スライドが自分の i で呼ぶ） ---
  function patch(i: number, p: Partial<QState>) {
    setStates((arr) => arr.map((s, k) => (k === i ? { ...s, ...p } : s)))
  }

  function submitWith(i: number, sel: string[]) {
    const qq = questions[i]
    const un = isUnscored(qq)
    const isCorrect = un ? false : gradeAnswer(qq, sel)
    setStates((arr) => arr.map((s, k) => (k === i ? { ...s, selected: sel, revealed: true } : s)))
    recordKangoAnswer({
      question_id: qq._id,
      exam_id: qq.exam_id,
      q_number: qq.q_number,
      selected_label: [...sel].sort().join(","),
      correct_label: correctLabels(qq.correct).join(","),
      is_correct: isCorrect,
      skipped: un,
      answered_at: new Date().toISOString(),
    })
  }

  function tapChoice(i: number, label: string) {
    const s = states[i]
    if (s.revealed) return
    const qq = questions[i]
    if (qq.answer_type === "multiple") {
      const has = s.selected.includes(label)
      const next = has
        ? s.selected.filter((l) => l !== label)
        : s.selected.length < requiredSelections(qq)
          ? [...s.selected, label]
          : s.selected
      patch(i, { selected: next })
    } else {
      submitWith(i, [label]) // 単一選択は1タップで即解答
    }
  }

  function canSubmitOf(i: number): boolean {
    const qq = questions[i]
    const s = states[i]
    return qq.answer_type === "numeric"
      ? s.numericText.trim() !== "" && !Number.isNaN(Number(s.numericText))
      : s.selected.length === requiredSelections(qq)
  }

  function submit(i: number) {
    if (!canSubmitOf(i)) return
    const qq = questions[i]
    const s = states[i]
    if (qq.answer_type === "numeric") submitWith(i, [String(Number(s.numericText))])
    else submitWith(i, s.selected)
  }

  function optionState(i: number, label: string): string {
    const qq = questions[i]
    const s = states[i]
    if (!s.revealed) return s.selected.includes(label) ? "selected" : "idle"
    if (isUnscored(qq)) return s.selected.includes(label) ? "selected" : "dim"
    if (correctLabels(qq.correct).includes(label)) return "correct"
    if (s.selected.includes(label)) return "wrong"
    return "dim"
  }

  // 次/前ボタン等のプログラム遷移（スワイプは下の touch ハンドラが指追従で処理）。
  function goto(target: number) {
    if (target < 0 || target >= count) return
    setIdx(target)
  }

  // --- 指追従スワイプ。touchAction:pan-y で縦スクロールは保持、横は JS が拾う ---
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    gesture.current = { x: t.clientX, y: t.clientY, dir: null, w: viewportRef.current?.clientWidth || 1 }
  }
  function onTouchMove(e: React.TouchEvent) {
    const g = gesture.current
    if (!g) return
    const t = e.touches[0]
    const dx = t.clientX - g.x
    const dy = t.clientY - g.y
    if (g.dir === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      g.dir = Math.abs(dx) > Math.abs(dy) ? "h" : "v" // 最初の動きで縦/横を確定
      if (g.dir === "h") setDragging(true)
    }
    if (g.dir !== "h") return
    let d = dx
    // 端（先頭で右 / 末尾で左）はゴムバンドで抵抗を付ける
    if ((idx === 0 && d > 0) || (idx === count - 1 && d < 0)) d *= 0.32
    dragRef.current = d
    setDrag(d)
  }
  function endDrag() {
    const g = gesture.current
    gesture.current = null
    setDragging(false)
    if (!g || g.dir !== "h") {
      setDrag(0)
      dragRef.current = 0
      return
    }
    const threshold = Math.min(80, (g.w || 1) * 0.22)
    const d = dragRef.current
    if (d <= -threshold && idx < count - 1) setIdx(idx + 1)
    else if (d >= threshold && idx > 0) setIdx(idx - 1)
    setDrag(0) // 残り距離を transition でスナップ（途中なら元位置へ戻る）
    dragRef.current = 0
  }

  // 1問分の本体（メタ行はカルーセル外に固定。idx ではなく引数 i で構築）。
  function renderSlide(i: number) {
    const qq = questions[i]
    const s = states[i]
    if (!qq || !s) return null
    const unscored = isUnscored(qq)
    const answered = s.revealed
    const correctNow = gradeAnswer(qq, s.selected)
    const labels = correctLabels(qq.correct)
    const tag = formatTag(qq)
    return (
      <>
        {/* 状況設定 */}
        {qq.scenario && (
          <div className="kn-card" style={{ padding: 16, marginBottom: 14 }}>
            <Chip>状況設定{qq.scenario.range ? ` 問${qq.scenario.range}` : ""}</Chip>
            <p style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.7, color: "var(--color-kn-text-2)" }}>{qq.scenario.text}</p>
          </div>
        )}

        {/* 問題カード */}
        <div className="kn-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: 9999,
                background: "linear-gradient(135deg,#3a78ff,#1f5fef)",
              }}
            >
              問題 {qq.q_number}
            </span>
            {tag && <Chip>{tag}</Chip>}
          </div>

          <p style={{ marginTop: 16, fontSize: 19, fontWeight: 700, lineHeight: 1.55, color: "var(--color-kn-text-1)" }}>
            {renderBody(qq.body, qq.glossary, setTerm)}
          </p>

          {/* 図 */}
          {qq.figures && qq.figures.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              {qq.figures.map((f, fi) =>
                f.url ? (
                  <button
                    key={f.id ?? fi}
                    onClick={() => setZoomFig(f)}
                    aria-label="図を拡大"
                    style={{ flex: "1 1 200px", padding: 0, border: "none", background: "none", cursor: "zoom-in" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.url}
                      alt={f.alt ?? `図${fi + 1}`}
                      style={{
                        width: "100%",
                        borderRadius: 16,
                        border: "1px solid var(--color-kn-line)",
                        background: "#fff",
                        padding: 8,
                      }}
                    />
                  </button>
                ) : null,
              )}
            </div>
          )}

          {/* 選択肢 / 計算入力 */}
          {qq.answer_type === "numeric" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
              <input
                value={s.numericText}
                onChange={(e) => patch(i, { numericText: e.target.value })}
                disabled={answered}
                inputMode="numeric"
                placeholder="数値を入力"
                style={{
                  flex: 1,
                  padding: 14,
                  fontSize: 20,
                  fontWeight: 700,
                  borderRadius: 12,
                  border: "1px solid var(--color-kn-line-strong)",
                  background: "var(--color-kn-surface-2)",
                  color: "var(--color-kn-text-1)",
                }}
              />
              {qq.unit && <span style={{ fontSize: 16, fontWeight: 600, color: "var(--color-kn-text-2)" }}>{qq.unit}</span>}
            </div>
          ) : (
            qq.choices &&
            qq.choices.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 14 }}>
                {qq.choices.map((ch) => {
                  const state = optionState(i, ch.label)
                  return (
                    <button key={ch.label} className="kn-option" data-state={state} disabled={answered} onClick={() => tapChoice(i, ch.label)}>
                      <span className="kn-option-num">{ch.label}</span>
                      <span className="kn-option-text">{ch.text}</span>
                    </button>
                  )
                })}
              </div>
            )
          )}

          {/* 解答ボタン (複数選択 / 計算のみ。単一は即解答) */}
          {!answered && qq.answer_type !== "single" && (
            <button className="kn-btn-primary" style={{ marginTop: 18 }} disabled={!canSubmitOf(i)} onClick={() => submit(i)}>
              解答する
            </button>
          )}

          {/* 結果バナー */}
          {answered && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 16px",
                borderRadius: 14,
                background: unscored
                  ? "var(--color-kn-surface-2)"
                  : correctNow
                    ? "var(--color-kn-success-soft)"
                    : "var(--color-kn-danger-soft)",
              }}
            >
              {unscored ? (
                <>
                  <span style={{ fontSize: 22, color: "var(--color-kn-text-2)" }} aria-hidden>
                    ⊖
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-kn-text-2)" }}>採点除外の問題</span>
                  <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--color-kn-text-3)" }}>正誤に数えません</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 22, color: correctNow ? "var(--color-kn-success)" : "var(--color-kn-danger)" }} aria-hidden>
                    {correctNow ? "✓" : "✕"}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: correctNow ? "var(--color-kn-success)" : "var(--color-kn-danger)" }}>
                    {correctNow ? "正解です！" : "不正解"}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--color-kn-text-2)" }}>
                    正解は <strong style={{ color: "var(--color-kn-text-1)" }}>{correctDisplay(qq.correct)}</strong>
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* 解説 */}
        {answered && (
          <div className="kn-card" style={{ padding: 16, marginTop: 14 }}>
            {qq.explanation ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span aria-hidden>💡</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-kn-text-1)" }}>解説</span>
                </div>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--color-kn-text-2)", margin: 0 }}>{qq.explanation.overall}</p>
                {qq.explanation.per_choice && qq.explanation.per_choice.length > 0 && (
                  <>
                    <hr style={{ border: "none", borderTop: "1px solid var(--color-kn-line)", margin: "14px 0" }} />
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-kn-text-3)", margin: "0 0 8px" }}>選択肢の解説</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {qq.explanation.per_choice.map((p) => {
                        const ok = labels.includes(p.label)
                        return (
                          <div key={p.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <span
                              style={{
                                flex: "none",
                                width: 26,
                                height: 26,
                                borderRadius: 9999,
                                display: "grid",
                                placeItems: "center",
                                fontSize: 13,
                                fontWeight: 800,
                                background: ok ? "var(--color-kn-success)" : "var(--color-kn-num-bg)",
                                color: ok ? "#fff" : "var(--color-kn-num-text)",
                              }}
                            >
                              {p.label}
                            </span>
                            <span style={{ flex: 1, fontSize: 13.5, lineHeight: 1.6, color: "var(--color-kn-text-2)" }}>{p.text}</span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
                {qq.explanation.sources && qq.explanation.sources.length > 0 && (
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--color-kn-text-3)" }}>
                      <span aria-hidden>📚</span>出典・参考
                    </div>
                    {qq.explanation.sources.map((src, si) => (
                      <a
                        key={si}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "9px 12px",
                          borderRadius: 10,
                          background: "var(--color-kn-surface-2)",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--color-kn-primary)",
                          textDecoration: "none",
                        }}
                      >
                        <span aria-hidden>🔗</span>
                        <span style={{ flex: 1, textDecoration: "underline" }}>{src.title}</span>
                        <span aria-hidden style={{ color: "var(--color-kn-text-3)", fontSize: 12 }}>↗</span>
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--color-kn-text-3)" }}>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: "var(--color-kn-text-2)", margin: 0 }}>解説は準備中です</p>
                <p style={{ fontSize: 12.5, margin: "4px 0 0" }}>この問題の解説は順次追加予定です。</p>
              </div>
            )}
          </div>
        )}

        {/* 分野・タグ (解答後にリンク表示) */}
        {answered && (qq.category || (qq.tags && qq.tags.length > 0)) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, alignItems: "center" }}>
            {qq.category && (
              <Link href={`/kango/category/${qq.category}`} className="kn-chip" style={{ textDecoration: "none" }}>
                {categoryBySlug(qq.category)?.name ?? qq.category}
              </Link>
            )}
            {qq.tags?.map((t) => (
              <Link
                key={t}
                href={`/kango/tag/${tagToSlug(t)}`}
                style={{ fontSize: 12, fontWeight: 700, color: "var(--color-kn-text-3)", textDecoration: "none" }}
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        {/* 前後ナビ */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
          <button className="kn-btn-ghost" disabled={i <= 0} onClick={() => goto(i - 1)} style={{ flex: 1 }}>
            ‹ 前の問題
          </button>
          <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--color-kn-text-2)", minWidth: 56 }}>
            {i + 1}/{count}
          </div>
          <button className="kn-btn-primary" disabled={i >= count - 1} onClick={() => goto(i + 1)} style={{ flex: 1, minHeight: 52 }}>
            次の問題 ›
          </button>
        </div>
      </>
    )
  }

  return (
    <main>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "8px 0 0" }}>
        {/* ヘッダ (固定: 現在問のお気に入り状態を反映) */}
        <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 20px 12px" }}>
          <Link
            href={backHref}
            aria-label="戻る"
            style={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              color: "var(--color-kn-text-2)",
              fontSize: 20,
              textDecoration: "none",
            }}
          >
            ‹
          </Link>
          <h1 style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 800, color: "var(--color-kn-text-1)", margin: 0 }}>
            {title}
          </h1>
          <button
            onClick={() => setBookmarked(toggleKangoBookmark(q._id))}
            aria-label="お気に入り"
            style={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: bookmarked ? "var(--color-kn-warn)" : "var(--color-kn-text-3)",
            }}
          >
            {bookmarked ? "★" : "☆"}
          </button>
        </header>

        {/* メタ: 試験名 / 進捗 / 経過 (固定。スワイプ中は現在の番号を表示しスナップ時に更新) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px 14px" }}>
          <Chip>
            <span aria-hidden>📅</span>
            {exam?.name ?? "看護師国家試験"}
          </Chip>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "baseline", fontSize: 12.5, color: "var(--color-kn-text-2)" }}>
              <span style={{ fontWeight: 700, color: "var(--color-kn-text-1)" }}>{idx + 1}</span>
              <span>/ {count}問</span>
            </div>
            <div style={{ marginTop: 5 }}>
              <ProgressBar value={(idx + 1) / Math.max(1, count)} />
            </div>
          </div>
          <ElapsedChip />
        </div>

        {/* 指追従カルーセル。track を translateX(-idx*100% + drag) で動かし、表示中±1のみ実体描画。
            現在ページだけが高さを決め(隣は height:0 で覗くだけ)、縦は touchAction:pan-y で温存。 */}
        <div
          ref={viewportRef}
          style={{ overflow: "hidden", touchAction: "pan-y" }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={endDrag}
          onTouchCancel={endDrag}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              transform: `translateX(calc(${-idx * 100}% + ${drag}px))`,
              transition: dragging ? "none" : "transform 0.32s cubic-bezier(0.22,0.61,0.36,1)",
              willChange: "transform",
            }}
          >
            {questions.map((_, i) => {
              const inWindow = Math.abs(i - idx) <= 1
              const isCur = i === idx
              return (
                <div key={i} style={{ flex: "0 0 100%", minWidth: "100%" }}>
                  <div style={isCur ? undefined : { height: 0 }}>
                    {inWindow ? <div style={{ padding: "0 20px 40px" }}>{renderSlide(i)}</div> : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 図の全画面ズーム */}
      {zoomFig?.url && (
        <div
          onClick={() => setZoomFig(null)}
          role="dialog"
          aria-modal="true"
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.85)", display: "grid", placeItems: "center", padding: 20, cursor: "zoom-out" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoomFig.url} alt={zoomFig.alt ?? "図"} style={{ maxWidth: "100%", maxHeight: "88vh", borderRadius: 8, background: "#fff" }} />
          <button
            onClick={() => setZoomFig(null)}
            aria-label="閉じる"
            style={{ position: "absolute", top: 16, right: 16, fontSize: 30, color: "#fff", background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
          {zoomFig.alt && (
            <p style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,.75)", fontSize: 13, padding: "0 20px" }}>
              {zoomFig.alt}
            </p>
          )}
        </div>
      )}

      {/* 用語シート (本文の難語タップで定義表示) */}
      {term && (
        <div
          onClick={() => setTerm(null)}
          role="dialog"
          aria-modal="true"
          aria-label={term.term}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.4)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 440, maxHeight: "80vh", overflowY: "auto", background: "var(--color-kn-surface)", borderRadius: "20px 20px 0 0", padding: 20, boxShadow: "0 -8px 40px rgba(0,0,0,.18)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "var(--color-kn-text-3)" }}>用語</div>
                <div style={{ marginTop: 3, fontSize: 19, fontWeight: 800, color: "var(--color-kn-text-1)", lineHeight: 1.3 }}>{term.term}</div>
              </div>
              <button
                onClick={() => setTerm(null)}
                aria-label="閉じる"
                style={{ flex: "none", width: 34, height: 34, borderRadius: 9999, border: "none", background: "var(--color-kn-surface-2)", color: "var(--color-kn-text-2)", fontSize: 16, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 14.5, lineHeight: 1.85, color: "var(--color-kn-text-2)", whiteSpace: "pre-line" }}>
              {term.definition}
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
