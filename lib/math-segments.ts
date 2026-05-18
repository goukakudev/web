export type Segment =
  | { kind: "text"; value: string }
  | { kind: "math"; value: string }
  | { kind: "table"; header: string[]; rows: string[][] };

function isPipeRow(line: string): boolean {
  const t = line.trim();
  return t.length >= 2 && t.startsWith("|") && t.endsWith("|");
}

function isSeparatorRow(line: string): boolean {
  if (!isPipeRow(line)) return false;
  const cells = line.trim().slice(1, -1).split("|");
  return cells.length > 0 && cells.every((c) => /^\s*:?-+:?\s*$/.test(c));
}

function parseCells(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((c) => c.trim());
}

function tryParseTable(
  lines: string[],
  start: number,
): { header: string[]; rows: string[][]; end: number } | null {
  if (start + 1 >= lines.length) return null;
  if (!isPipeRow(lines[start])) return null;
  if (!isSeparatorRow(lines[start + 1])) return null;
  const header = parseCells(lines[start]);
  const rows: string[][] = [];
  let i = start + 2;
  while (i < lines.length && isPipeRow(lines[i]) && !isSeparatorRow(lines[i])) {
    rows.push(parseCells(lines[i]));
    i++;
  }
  return { header, rows, end: i };
}

function parseInline(text: string): Segment[] {
  const out: Segment[] = [];
  let i = 0;
  let buffer = "";
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\" && text[i + 1] === "$") {
      buffer += "$";
      i += 2;
      continue;
    }
    if (ch === "$") {
      const close = text.indexOf("$", i + 1);
      if (close === -1) {
        buffer += text.slice(i);
        i = text.length;
        break;
      }
      if (buffer) {
        out.push({ kind: "text", value: buffer });
        buffer = "";
      }
      out.push({ kind: "math", value: text.slice(i + 1, close) });
      i = close + 1;
      continue;
    }
    buffer += ch;
    i++;
  }
  if (buffer) out.push({ kind: "text", value: buffer });
  return out;
}

function appendText(segments: Segment[], value: string): void {
  if (value.length === 0) return;
  const last = segments[segments.length - 1];
  if (last && last.kind === "text") {
    last.value += value;
    return;
  }
  segments.push({ kind: "text", value });
}

export function parseSegments(input: string): Segment[] {
  const lines = input.split("\n");
  const segments: Segment[] = [];
  const textBuffer: string[] = [];

  function flushTextBuffer(): void {
    if (textBuffer.length === 0) return;
    const joined = textBuffer.join("\n");
    textBuffer.length = 0;
    for (const seg of parseInline(joined)) {
      if (seg.kind === "text") {
        appendText(segments, seg.value);
      } else {
        segments.push(seg);
      }
    }
  }

  let i = 0;
  while (i < lines.length) {
    const table = tryParseTable(lines, i);
    if (table) {
      if (textBuffer.length > 0) {
        textBuffer.push("");
      }
      flushTextBuffer();
      segments.push({ kind: "table", header: table.header, rows: table.rows });
      i = table.end;
      if (i < lines.length) {
        textBuffer.push("");
      }
      continue;
    }
    textBuffer.push(lines[i]);
    i++;
  }
  flushTextBuffer();
  return segments;
}
