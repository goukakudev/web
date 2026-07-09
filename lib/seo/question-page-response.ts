import {
  loadSeoQuestionPageData,
  type SeoQuestionPageData,
} from "@/lib/seo/question-page-data"
import {
  renderQuestionNotFoundHtml,
  renderQuestionPageHtml,
} from "@/lib/seo/question-page-html"
import { isIndexableQuestion } from "@/lib/seo/question-quality"
import {
  SEO_QUESTION_SUBJECTS,
  type SeoQuestionSubject,
} from "@/lib/seo/question-url"

function htmlHeaders(indexable: boolean): HeadersInit {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=0, s-maxage=86400",
    // HTML meta robots と揃え、薄い解説はヘッダでも noindex。
    "X-Robots-Tag": indexable ? "index, follow" : "noindex, follow",
  }
}

export async function questionPageResponse(
  subject: SeoQuestionSubject,
  slug: string,
): Promise<Response> {
  const data = await loadSeoQuestionPageData(subject, slug)
  if (!data) {
    return new Response(renderQuestionNotFoundHtml(), {
      status: 404,
      headers: htmlHeaders(false),
    })
  }

  const requestedPath = `${SEO_QUESTION_SUBJECTS[subject].questionsPath}/${slug}`
  if (data.canonicalPath !== requestedPath) {
    return new Response(null, {
      status: 308,
      headers: {
        Location: data.canonicalPath,
        "Cache-Control": "public, max-age=0, s-maxage=86400",
      },
    })
  }

  // FE/IP のみ品質ゲート通過で index。それ以外の subject は noindex 維持。
  const indexable =
    (subject === "ip" || subject === "fe") && isIndexableQuestion(data.question)
  return new Response(renderQuestionPageHtml(toRenderInput(subject, data)), {
    headers: htmlHeaders(indexable),
  })
}

function toRenderInput(subject: SeoQuestionSubject, data: SeoQuestionPageData) {
  return {
    subject,
    exam: data.exam,
    question: data.question,
    questions: data.questions,
  }
}
