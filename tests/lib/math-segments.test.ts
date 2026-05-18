import { describe, it, expect } from "vitest";
import { parseSegments } from "@/lib/math-segments";

describe("parseSegments", () => {
  it("returns one text segment for plain text", () => {
    expect(parseSegments("hello")).toEqual([{ kind: "text", value: "hello" }]);
  });

  it("splits on single-line $...$ math", () => {
    const out = parseSegments("a $x^2$ b");
    expect(out).toEqual([
      { kind: "text", value: "a " },
      { kind: "math", value: "x^2" },
      { kind: "text", value: " b" },
    ]);
  });

  it("supports multiple math segments", () => {
    expect(parseSegments("$a$ then $b$")).toEqual([
      { kind: "math", value: "a" },
      { kind: "text", value: " then " },
      { kind: "math", value: "b" },
    ]);
  });

  it("detects a markdown table block", () => {
    const out = parseSegments("intro\n| a | b |\n|---|---|\n| 1 | 2 |\ntail");
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ kind: "text", value: "intro\n" });
    expect(out[1].kind).toBe("table");
    if (out[1].kind === "table") {
      expect(out[1].header).toEqual(["a", "b"]);
      expect(out[1].rows).toEqual([["1", "2"]]);
    }
    expect(out[2]).toEqual({ kind: "text", value: "\ntail" });
  });

  it("treats incomplete tables (no separator row) as plain text", () => {
    const out = parseSegments("| a | b |\n| 1 | 2 |");
    expect(out).toEqual([{ kind: "text", value: "| a | b |\n| 1 | 2 |" }]);
  });

  it("unescapes $ when escaped with backslash", () => {
    const out = parseSegments("price: \\$10");
    expect(out).toEqual([{ kind: "text", value: "price: $10" }]);
  });
});
