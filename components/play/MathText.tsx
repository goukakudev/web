import katex from "katex";
import { parseSegments } from "@/lib/math-segments";

export interface MathTextProps {
  text: string;
  mathSize?: "sm" | "base";
  className?: string;
}

export function MathText({ text, mathSize = "base", className }: MathTextProps) {
  const segments = parseSegments(text);
  const fontSize = mathSize === "sm" ? "0.85em" : "1em";
  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.kind === "text") {
          return (
            <span key={idx} className="whitespace-pre-wrap">
              {seg.value}
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
