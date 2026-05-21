import katex from "katex";
import type { ReactNode } from "react";
import { parseSegments } from "@/lib/math-segments";
import { findGlossaryMatches } from "@/lib/glossary";

export interface MathTextProps {
  text: string;
  mathSize?: "sm" | "base";
  className?: string;
  glossaryEnabled?: boolean;
  glossaryExclude?: ReadonlySet<string>;
  onGlossaryClick?: (term: string) => void;
}

const EMPTY_SET: ReadonlySet<string> = new Set();

export function MathText({
  text,
  mathSize = "base",
  className,
  glossaryEnabled = true,
  glossaryExclude = EMPTY_SET,
  onGlossaryClick,
}: MathTextProps) {
  const segments = parseSegments(text);
  const fontSize = mathSize === "sm" ? "0.85em" : "1em";
  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.kind === "text") {
          return (
            <span key={idx} className="whitespace-pre-wrap">
              {glossaryEnabled
                ? renderTextWithGlossary(seg.value, glossaryExclude, onGlossaryClick)
                : seg.value}
            </span>
          );
        }
        if (seg.kind === "math") {
          const html = katex.renderToString(seg.value, {
            throwOnError: false,
            output: "html",
          });
          return (
            <span
              key={idx}
              style={{ fontSize }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return (
          <table
            key={idx}
            className="my-3 border border-goukaku-divider rounded text-[12px]"
          >
            <thead className="bg-goukaku-divider/30">
              <tr>
                {seg.header.map((h, hi) => (
                  <th key={hi} className="px-2 py-1 text-left font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seg.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-2 py-1 border-t border-goukaku-divider"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      })}
    </span>
  );
}

function renderTextWithGlossary(
  text: string,
  exclude: ReadonlySet<string>,
  onClick: ((term: string) => void) | undefined,
): ReactNode[] {
  const matches = findGlossaryMatches(text, exclude);
  if (matches.length === 0) return [text];

  const ordered = [...matches].sort((a, b) => a.start - b.start);
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < ordered.length; i++) {
    const m = ordered[i];
    if (m.start > cursor) {
      parts.push(text.slice(cursor, m.start));
    }
    const inner = text.slice(m.start, m.end);
    if (onClick) {
      parts.push(
        <button
          key={`g-${i}`}
          type="button"
          onClick={() => onClick(m.term)}
          className="underline decoration-dotted underline-offset-2 text-goukaku-pink-script font-bold hover:opacity-80"
        >
          {inner}
        </button>,
      );
    } else {
      parts.push(
        <span
          key={`g-${i}`}
          className="underline decoration-dotted underline-offset-2 text-goukaku-pink-script font-bold"
        >
          {inner}
        </span>,
      );
    }
    cursor = m.end;
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }
  return parts;
}
