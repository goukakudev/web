import { describe, it, expect } from "vitest";
import { tagToSlug, slugToTag } from "@/lib/tag-url";

describe("tag-url", () => {
  it("strips leading # for slug", () => {
    expect(tagToSlug("#CPU")).toBe("CPU");
  });

  it("encodes Japanese tags", () => {
    expect(tagToSlug("#関係モデル")).toBe(
      "%E9%96%A2%E4%BF%82%E3%83%A2%E3%83%87%E3%83%AB",
    );
  });

  it("re-adds # when converting slug back to tag", () => {
    expect(slugToTag("CPU")).toBe("#CPU");
    expect(slugToTag("%E9%96%A2%E4%BF%82%E3%83%A2%E3%83%87%E3%83%AB")).toBe(
      "#関係モデル",
    );
  });

  it("slugToTag is tolerant to legacy slugs that still include #", () => {
    expect(slugToTag("%23CPU")).toBe("#CPU");
  });

  it("roundtrip: tag → slug → tag", () => {
    for (const tag of ["#CPU", "#関係モデル", "#OR分析", "#TCPIP"]) {
      expect(slugToTag(tagToSlug(tag))).toBe(tag);
    }
  });
});
