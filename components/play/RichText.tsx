"use client";

/**
 * 問題文/解説文/選択肢 用のリッチテキスト renderer。iOS 版 RubyText 相当。
 *
 * 機能:
 *  - 用語リンク (terms.json) を最長一致で検出し、初出 1 件のみリンク化
 *  - ふりがな (ruby.json) を全出現箇所に <ruby> タグで上付き表示
 *  - 改行 (\n) 維持
 *  - クリックで onTermTap?(term) コールバック
 *  - enableTermLinks=false で用語リンク無効化 (選択肢で利用)
 *
 * 文字列を1パスで走査し、用語マッチ・ルビマッチを overlap-free にマージしてから
 * React ノードに変換する (用語リンクとルビは重なっても可: ルビ優先で内側に nest)。
 */
import { useEffect, useState, useMemo } from "react";
import { loadTerms, findTermMatches, orderedTermKeys } from "@/lib/takken/terms";
import { loadRuby, findRubyMatches, orderedRubyKeys } from "@/lib/takken/ruby";

type Ready = { terms: boolean; ruby: boolean };

let assetsReady: Ready = { terms: false, ruby: false };
let assetsPromise: Promise<void> | null = null;

function ensureAssets(): Promise<void> {
  if (assetsReady.terms && assetsReady.ruby) return Promise.resolve();
  if (!assetsPromise) {
    assetsPromise = Promise.all([
      loadTerms().then(() => {
        assetsReady = { ...assetsReady, terms: true };
      }),
      loadRuby().then(() => {
        assetsReady = { ...assetsReady, ruby: true };
      }),
    ]).then(() => undefined);
  }
  return assetsPromise;
}

export function RichText({
  text,
  className,
  enableTermLinks = true,
  onTermTap,
}: {
  text: string;
  className?: string;
  enableTermLinks?: boolean;
  onTermTap?: (term: string) => void;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    ensureAssets().then(() => {
      if (!cancelled) setTick((t) => t + 1);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const nodes = useMemo(() => {
    return renderRich(text, { enableTermLinks, onTermTap });
    // tick: asset 読み込み完了後の再 render トリガ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enableTermLinks, onTermTap, tick]);

  return <span className={className}>{nodes}</span>;
}

type Segment =
  | { kind: "text"; text: string }
  | { kind: "term"; text: string; term: string }
  | { kind: "ruby"; text: string; reading: string }
  | {
      kind: "term-ruby";
      text: string;
      term: string;
      readings: Array<{ start: number; end: number; reading: string; word: string }>;
    };

function renderRich(
  text: string,
  opts: { enableTermLinks: boolean; onTermTap?: (term: string) => void },
): React.ReactNode[] {
  if (!text) return [];

  // ルビは常に有効
  const rubyMatches = orderedRubyKeys().length > 0 ? findRubyMatches(text) : [];
  // 用語リンクは enableTermLinks のみ
  const termMatches =
    opts.enableTermLinks && orderedTermKeys().length > 0
      ? findTermMatches(text)
      : [];

  // 範囲をマージ: 用語が外側、ルビが内側 (用語内のルビは保持)
  const segments: Segment[] = [];
  let cursor = 0;

  // termMatches は disjoint (overlap-free)
  for (const tm of termMatches) {
    if (cursor < tm.start) {
      sliceWithRuby(text, cursor, tm.start, rubyMatches, segments);
    }
    const innerRubies = rubyMatches.filter(
      (r) => r.start >= tm.start && r.end <= tm.end,
    );
    const slice = text.slice(tm.start, tm.end);
    if (innerRubies.length === 0) {
      segments.push({ kind: "term", text: slice, term: tm.term });
    } else {
      segments.push({
        kind: "term-ruby",
        text: slice,
        term: tm.term,
        readings: innerRubies.map((r) => ({
          start: r.start - tm.start,
          end: r.end - tm.start,
          reading: r.reading,
          word: r.word,
        })),
      });
    }
    cursor = tm.end;
  }
  if (cursor < text.length) {
    sliceWithRuby(text, cursor, text.length, rubyMatches, segments);
  }

  // React ノード化 (改行は <br /> に)
  return segments.flatMap((s, i) => segmentToNodes(s, i, opts.onTermTap));
}

/**
 * [start, end) の範囲を、含まれるルビをマーカに splice して segments に追加する。
 * 用語マッチは無関係 (用語外の領域なので)。
 */
function sliceWithRuby(
  text: string,
  start: number,
  end: number,
  rubyMatches: ReturnType<typeof findRubyMatches>,
  out: Segment[],
): void {
  const internal = rubyMatches.filter((r) => r.start >= start && r.end <= end);
  let c = start;
  for (const r of internal) {
    if (c < r.start) {
      out.push({ kind: "text", text: text.slice(c, r.start) });
    }
    out.push({ kind: "ruby", text: text.slice(r.start, r.end), reading: r.reading });
    c = r.end;
  }
  if (c < end) {
    out.push({ kind: "text", text: text.slice(c, end) });
  }
}

function segmentToNodes(
  s: Segment,
  idx: number,
  onTermTap?: (term: string) => void,
): React.ReactNode[] {
  if (s.kind === "text") {
    return [renderTextWithBreaks(s.text, `t${idx}`)];
  }
  if (s.kind === "ruby") {
    return [
      <ruby key={`r${idx}`}>
        {s.text}
        <rt className="text-[0.55em] tracking-wide text-ink-3">{s.reading}</rt>
      </ruby>,
    ];
  }
  if (s.kind === "term") {
    return [
      <button
        key={`tm${idx}`}
        type="button"
        onClick={() => onTermTap?.(s.term)}
        className="text-tk-gold-dark underline decoration-tk-gold-dark/60 underline-offset-2 transition hover:opacity-80"
      >
        {renderTextWithBreaks(s.text, `tm${idx}txt`)}
      </button>,
    ];
  }
  if (s.kind === "term-ruby") {
    // 用語スパン内部にルビを埋める
    const inner: React.ReactNode[] = [];
    let c = 0;
    s.readings.forEach((r, ri) => {
      if (c < r.start) {
        inner.push(renderTextWithBreaks(s.text.slice(c, r.start), `tri${idx}-${ri}a`));
      }
      inner.push(
        <ruby key={`tri${idx}-${ri}r`}>
          {s.text.slice(r.start, r.end)}
          <rt className="text-[0.55em] tracking-wide text-ink-3">{r.reading}</rt>
        </ruby>,
      );
      c = r.end;
    });
    if (c < s.text.length) {
      inner.push(renderTextWithBreaks(s.text.slice(c), `tri${idx}-tail`));
    }
    return [
      <button
        key={`tmr${idx}`}
        type="button"
        onClick={() => onTermTap?.(s.term)}
        className="text-tk-gold-dark underline decoration-tk-gold-dark/60 underline-offset-2 transition hover:opacity-80"
      >
        {inner}
      </button>,
    ];
  }
  return [];
}

function renderTextWithBreaks(text: string, key: string): React.ReactNode {
  if (!text.includes("\n")) return <span key={key}>{text}</span>;
  const parts = text.split("\n");
  return (
    <span key={key}>
      {parts.map((p, i) => (
        <span key={`${key}-${i}`}>
          {p}
          {i < parts.length - 1 ? <br /> : null}
        </span>
      ))}
    </span>
  );
}
