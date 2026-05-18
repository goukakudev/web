import type { MetadataRoute } from "next";
import { listExams, listQuestions } from "@/lib/api-client";

const BASE = "https://goukaku.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const exams = await listExams();
  const now = new Date();

  const out: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  for (const exam of exams) {
    out.push({
      url: `${BASE}/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });

    try {
      const questions = await listQuestions(exam.exam_id);
      for (const q of questions) {
        out.push({
          url: `${BASE}/play/${exam.exam_id}/q/${q.q_number}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    } catch {
      // skip exams whose questions can't be fetched at build time
    }
  }

  return out;
}
