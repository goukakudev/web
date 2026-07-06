import {
  loadSeoQuestionPageData,
  type SeoQuestionPageData,
} from "@/lib/seo/question-page-data"
import {
  renderQuestionNotFoundHtml,
  renderQuestionPageHtml,
} from "@/lib/seo/question-page-html"
import {
  SEO_QUESTION_SUBJECTS,
  type SeoQuestionSubject,
} from "@/lib/seo/question-url"

// 設問本文は公開過去問で他サイトと同一のため、全設問ページを検索
// インデックスから外す (2026-07 方針転換、lib/seo/indexing-policy.ts 参照)。
// HTML 内の meta robots に加えヘッダでも宣言する。
const HTML_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "public, max-age=0, s-maxage=86400",
  "X-Robots-Tag": "noindex, follow",
}

export async function questionPageResponse(
  subject: SeoQuestionSubject,
  slug: string,
): Promise<Response> {
  const data = await loadSeoQuestionPageData(subject, slug)
  if (!data) {
    return new Response(renderQuestionNotFoundHtml(), {
      status: 404,
      headers: HTML_HEADERS,
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

  return new Response(renderQuestionPageHtml(toRenderInput(subject, data)), {
    headers: HTML_HEADERS,
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
