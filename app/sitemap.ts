import type { MetadataRoute } from "next";
import {
  listExams,
  listQuestions,
  listIpExams,
  listIpQuestions,
} from "@/lib/api-client";
import { tagToSlug } from "@/lib/tag-url";

const BASE = "https://goukaku.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [exams, ipExams] = await Promise.all([listExams(), listIpExams()]);
  const now = new Date();

  const out: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/ip`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/fe`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/takken`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/about`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
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

  for (const exam of ipExams) {
    out.push({
      url: `${BASE}/ip/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });

    try {
      const questions = await listIpQuestions(exam.exam_id);
      for (const q of questions) {
        out.push({
          url: `${BASE}/ip/play/${exam.exam_id}/q/${q.q_number}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    } catch {
      // skip ip exams whose questions can't be fetched at build time
    }
  }

  return out;
}
