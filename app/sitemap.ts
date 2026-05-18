import type { MetadataRoute } from "next";
import { listExams, listQuestions } from "@/lib/api-client";
import { tagToSlug } from "@/lib/tag-url";

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

  const tagSet = new Set<string>();

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
        for (const t of q.tags ?? []) {
          if (t) tagSet.add(t);
        }
      }
    } catch {
      // skip exams whose questions can't be fetched at build time
    }
  }

  for (const tag of [...tagSet].sort()) {
    out.push({
      url: `${BASE}/tag/${tagToSlug(tag)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return out;
}
