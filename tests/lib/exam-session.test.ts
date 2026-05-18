import { describe, it, expect, beforeEach } from "vitest";
import {
  addExamSession,
  loadExamSessions,
  latestSessionFor,
  type ExamSession,
} from "@/lib/exam-session";

beforeEach(() => {
  localStorage.clear();
});

const sample: ExamSession = {
  id: "s1",
  exam_id: "fe-2017",
  finished_at: "2026-05-17T10:00:00.000Z",
  elapsed_seconds: 1200,
  correct: 10,
  answered: 20,
};

describe("exam-session", () => {
  it("starts empty", () => {
    expect(loadExamSessions()).toEqual([]);
  });

  it("adds a session", () => {
    addExamSession(sample);
    expect(loadExamSessions()).toHaveLength(1);
  });

  it("dedupes by id and keeps newest first", () => {
    addExamSession({ ...sample, id: "s1", finished_at: "2026-05-17T10:00:00.000Z" });
    addExamSession({ ...sample, id: "s2", finished_at: "2026-05-17T11:00:00.000Z" });
    const all = loadExamSessions();
    expect(all.map((s) => s.id)).toEqual(["s2", "s1"]);
  });

  it("latestSessionFor returns most recent for an exam, undefined if none", () => {
    addExamSession({ ...sample, id: "s1", exam_id: "fe-2017", finished_at: "2026-05-17T10:00:00.000Z" });
    addExamSession({ ...sample, id: "s2", exam_id: "fe-2017", finished_at: "2026-05-17T12:00:00.000Z" });
    addExamSession({ ...sample, id: "s3", exam_id: "fe-2018", finished_at: "2026-05-17T11:00:00.000Z" });
    expect(latestSessionFor("fe-2017")?.id).toBe("s2");
    expect(latestSessionFor("missing")).toBeUndefined();
  });
});
