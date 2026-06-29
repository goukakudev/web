import type { ExamSummary, Question } from "@/lib/types"
import {
  breadcrumbJsonLd,
  questionJsonLd,
  SITE_NAME,
  SITE_URL,
  webPageJsonLd,
} from "@/lib/seo/structured-data"
import { termToSlug } from "@/lib/seo/glossary"
import {
  broadQuestionTags,
  relatedGlossaryTerms,
  relatedQuestionLinks,
  specificQuestionTags,
} from "@/lib/seo/question-related"
import {
  formatExamLabel,
  pickQuestionTopic,
  questionCanonicalPath,
  questionPlayPath,
  questionSeoDescription,
  questionSeoTitle,
  SEO_QUESTION_SUBJECTS,
  type SeoQuestionSubject,
} from "@/lib/seo/question-url"
import { stripMd } from "@/lib/text-utils"

interface RenderQuestionPageHtmlInput {
  subject: SeoQuestionSubject
  exam: ExamSummary
  question: Question
  questions: Question[]
}

const IOS_APP_URLS: Partial<Record<SeoQuestionSubject, string>> = {
  ip: "https://apps.apple.com/jp/app/goukaku-itパスポート-過去問/id6774202965",
  fe: "https://apps.apple.com/jp/app/基本情報技術者-過去問/id6770801070",
  sg: "https://apps.apple.com/app/goukaku-情報セキュリティマネジメント-過去問/id6776073219",
}

export function renderQuestionPageHtml({
  subject,
  exam,
  question,
  questions,
}: RenderQuestionPageHtmlInput): string {
  const config = SEO_QUESTION_SUBJECTS[subject]
  const canonicalPath = questionCanonicalPath(subject, exam, question)
  const canonicalUrl = `${SITE_URL}${canonicalPath}`
  const examLabel = formatExamLabel(exam, subject)
  const title = questionSeoTitle(subject, exam, question)
  const description = questionSeoDescription(subject, exam, question)
  const topic = pickQuestionTopic(question)
  const accepted = question.correct_label
    ? question.choices.find((choice) => choice.label === question.correct_label)
    : undefined
  const terms = relatedGlossaryTerms(question)
  const related = relatedQuestionLinks(subject, exam, question, questions)
  const prev = questions.find((item) => item.q_number === question.q_number - 1)
  const next = questions.find((item) => item.q_number === question.q_number + 1)
  const specificTags = specificQuestionTags(question)
  const broadTags = broadQuestionTags(question)
  const playPath = questionPlayPath(subject, exam.exam_id, question.q_number)
  const appUrl = IOS_APP_URLS[subject]

  const breadcrumbs = [
    { name: SITE_NAME, url: `${SITE_URL}/` },
    { name: config.fullName, url: `${SITE_URL}/${subject}` },
    { name: "問題解説", url: `${SITE_URL}${config.questionsPath}` },
    { name: examLabel, url: `${SITE_URL}${config.examPath}/${exam.exam_id}` },
    { name: `問${question.q_number}`, url: canonicalUrl },
  ]

  return `<!doctype html>
<html lang="ja">
<head>
${renderHead({ title, description, canonicalUrl, noindex: false })}
${jsonLd(webPageJsonLd({ name: title, description, url: canonicalUrl }))}
${jsonLd(breadcrumbJsonLd(breadcrumbs))}
${jsonLd(
  questionJsonLd({
    name: `${topic} - ${config.fullName} ${examLabel} 問${question.q_number}`,
    text: stripMd(question.body),
    url: canonicalUrl,
    choices: question.choices.map((choice) => ({
      label: choice.label,
      text: stripMd(choice.text),
    })),
    correctLabel: question.correct_label,
    explanation: question.explanation?.overall
      ? stripMd(question.explanation.overall)
      : undefined,
    partOfName: `${config.fullName} ${examLabel} 過去問`,
    partOfUrl: `${SITE_URL}${config.examPath}/${exam.exam_id}`,
  }),
)}
</head>
<body>
<main class="frame">
  ${renderBreadcrumbs(breadcrumbs)}
  <article class="article">
    <p class="eyebrow">${escapeHtml(config.fullName)} 過去問解説</p>
    <h1>${escapeHtml(title)}</h1>
    <p class="lead">${escapeHtml(config.fullName)} ${escapeHtml(examLabel)} 問${question.q_number}は、<strong>${escapeHtml(topic)}</strong>に関する理解を問う問題です。検索から入っても、問題文、選択肢、正解、解説、各選択肢がなぜ違うかをこのページだけで確認できます。</p>
    <div class="cta-grid">
      <a class="button primary" href="${escapeAttr(playPath)}" data-analytics-event="start_practice_click" data-analytics-props="${analyticsProps({ subject, exam_id: exam.exam_id, q_number: question.q_number, source: "question_seo_html" })}">アプリ形式でこの問題を解く</a>
      <a class="button secondary" href="/pro" data-analytics-event="pro_cta_click" data-analytics-props="${analyticsProps({ subject, source: "question_seo_top" })}">弱点分析・復習リマインダーを見る</a>
    </div>

    <section>
      <h2>問題文</h2>
      <div class="card important">${renderPreText(question.body)}${renderFigures(question)}</div>
    </section>

    <section>
      <h2>この問題の出題ポイント</h2>
      <ul class="check-list">
        <li>${escapeHtml(topic)}の定義だけでなく、問題文中の条件がどの選択肢に当てはまるかを確認する。</li>
        ${broadTags[0] ? `<li>${escapeHtml(broadTags[0])}分野では、用語の目的・主体・責任範囲の違いが選択肢で問われやすい。</li>` : ""}
        ${specificTags.length > 0 ? `<li>関連タグ: ${specificTags.map(escapeHtml).join("、")}。</li>` : ""}
      </ul>
    </section>

    <section>
      <h2>選択肢</h2>
      <ol class="choices">
        ${question.choices
          .map((choice) => {
            const correct = choice.label === question.correct_label
            return `<li class="${correct ? "correct" : ""}"><span class="choice-label">${escapeHtml(choice.label)}</span><span>${renderInlineText(choice.text)}</span>${correct ? '<span class="badge">正解</span>' : ""}</li>`
          })
          .join("")}
      </ol>
    </section>

    ${
      accepted && question.correct_label
        ? `<section class="answer"><h2>正解</h2><p><strong>${escapeHtml(question.correct_label)}</strong>: ${renderInlineText(accepted.text)}</p></section>`
        : ""
    }

    ${
      question.explanation?.overall
        ? `<section><h2>解説</h2><div class="card">${renderPreText(question.explanation.overall)}</div></section>`
        : ""
    }

    ${
      question.explanation?.per_choice?.length
        ? `<section><h2>なぜ他の選択肢が違うのか</h2><ul class="choice-explanations">${question.explanation.per_choice
            .map(
              (choice) =>
                `<li><p class="choice-heading">${escapeHtml(choice.label)}${choice.label === question.correct_label ? "（正解）" : ""}</p><p>${renderInlineText(choice.text)}</p></li>`,
            )
            .join("")}</ul></section>`
        : ""
    }

    <section>
      <h2>解き方の整理</h2>
      <p>${escapeHtml(topic)}の問題では、選択肢のキーワードだけで判断せず、問題文が示す条件と正解選択肢の説明が一致しているかを見ます。誤答選択肢は、似た用語を混ぜる、主体を入れ替える、目的や範囲を広げすぎる、という形で作られることが多いため、選択肢別解説まで確認しておくと復習効率が上がります。</p>
    </section>

    ${renderRelatedTerms(terms)}
    ${renderRelatedQuestions({ subject, exam, examLabel, question, prev, next, related })}

    <section class="monetize">
      <h2>復習を続ける</h2>
      <p>間違えた問題、苦手タグ、模試履歴を保存して復習する導線を用意しています。広告なしPro、弱点分析、復習リマインダーは段階的に提供予定です。</p>
      <div class="cta-grid">
        <a class="button primary" href="/pro" data-analytics-event="pro_cta_click" data-analytics-props="${analyticsProps({ subject, source: "question_seo_bottom" })}">Pro機能を見る</a>
        ${appUrl ? `<a class="button secondary" href="${escapeAttr(appUrl)}" target="_blank" rel="noopener noreferrer" data-analytics-event="app_store_click" data-analytics-props="${analyticsProps({ subject, source: "question_seo_bottom" })}">${escapeHtml(config.shortName)}アプリを開く</a>` : ""}
      </div>
    </section>
  </article>
</main>
${trackingScript()}
</body>
</html>`
}

export function renderQuestionNotFoundHtml(): string {
  return `<!doctype html><html lang="ja"><head>${renderHead({
    title: "問題が見つかりません | 合格.dev",
    description: "指定された問題解説ページは見つかりませんでした。",
    canonicalUrl: `${SITE_URL}/`,
    noindex: true,
  })}</head><body><main class="frame"><h1>問題が見つかりません</h1><p>URLを確認するか、資格トップから問題を探してください。</p><p><a href="/">合格.devトップへ</a></p></main></body></html>`
}

function renderHead({
  title,
  description,
  canonicalUrl,
  noindex,
}: {
  title: string
  description: string
  canonicalUrl: string
  noindex: boolean
}) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow"}">
<link rel="canonical" href="${escapeAttr(canonicalUrl)}">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:url" content="${escapeAttr(canonicalUrl)}">
<meta property="og:locale" content="ja_JP">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary">
<style>${pageCss()}</style>`
}

function renderBreadcrumbs(items: { name: string; url: string }[]): string {
  const links = items
    .map((item, index) => {
      const label = escapeHtml(item.name)
      const path = item.url.startsWith(SITE_URL) ? item.url.slice(SITE_URL.length) || "/" : item.url
      const content =
        index === items.length - 1
          ? `<span aria-current="page">${label}</span>`
          : `<a href="${escapeAttr(path)}">${label}</a><span aria-hidden="true">›</span>`
      return `<li>${content}</li>`
    })
    .join("")
  return `<nav aria-label="パンくず" class="breadcrumbs"><ol>${links}</ol></nav>`
}

function renderRelatedTerms(terms: ReturnType<typeof relatedGlossaryTerms>): string {
  if (terms.length === 0) return ""
  return `<section><h2>関連用語</h2><ul class="term-grid">${terms
    .map(
      (term) =>
        `<li><a href="/glossary/${termToSlug(term.term)}" data-analytics-event="glossary_link_click" data-analytics-props="${analyticsProps({ term: term.term, source: "question_seo_html" })}"><strong>${escapeHtml(term.term)}</strong><span>${escapeHtml(term.category)}</span></a></li>`,
    )
    .join("")}</ul></section>`
}

function renderRelatedQuestions({
  subject,
  exam,
  examLabel,
  prev,
  next,
  related,
}: {
  subject: SeoQuestionSubject
  exam: ExamSummary
  examLabel: string
  question: Question
  prev?: Question
  next?: Question
  related: ReturnType<typeof relatedQuestionLinks>
}): string {
  const config = SEO_QUESTION_SUBJECTS[subject]
  const nearby = [prev, next]
    .filter((item): item is Question => Boolean(item))
    .map((item) =>
      renderQuestionLink(subject, exam, item, `問${item.q_number}`, "nearby"),
    )
    .join("")
  const relatedItems = related
    .map((item) =>
      renderQuestionLink(subject, exam, item.question, `問${item.question.q_number}`, item.reason, item.label),
    )
    .join("")
  return `<section><h2>関連問題</h2>
    ${nearby ? `<h3>前後の問題</h3><div class="related-list">${nearby}</div>` : ""}
    ${relatedItems ? `<h3>${escapeHtml(examLabel)} の関連する問題</h3><div class="related-list">${relatedItems}</div>` : ""}
    <p class="small-links"><a href="${escapeAttr(`${config.examPath}/${exam.exam_id}`)}">${escapeHtml(examLabel)}の問題一覧</a> <a href="${escapeAttr(config.questionsPath)}">${escapeHtml(config.fullName)}の解説一覧</a></p>
  </section>`
}

function renderQuestionLink(
  subject: SeoQuestionSubject,
  exam: ExamSummary,
  question: Question,
  label: string,
  relation: string,
  reason?: string,
): string {
  const href = questionCanonicalPath(subject, exam, question)
  const preview = previewText(question.body, 68)
  return `<a class="related-card" href="${escapeAttr(href)}" data-analytics-event="related_question_click" data-analytics-props="${analyticsProps({ subject, relation })}"><span>${escapeHtml(label)}${reason ? ` · ${escapeHtml(reason)}` : ""}</span><strong>${escapeHtml(preview)}</strong></a>`
}

function renderFigures(question: Question): string {
  if (!question.figures?.length) return ""
  return `<div class="figures">${question.figures
    .map(
      (figure) =>
        `<img src="${escapeAttr(figure.url)}" alt="${escapeAttr(figure.alt ?? "")}" loading="lazy">`,
    )
    .join("")}</div>`
}

function renderPreText(text: string): string {
  return `<div class="pre">${escapeHtml(stripMd(text))}</div>`
}

function renderInlineText(text: string): string {
  return escapeHtml(stripMd(text)).replace(/\n/g, "<br>")
}

function previewText(text: string, limit: number): string {
  const clean = stripMd(text).replace(/\s+/g, " ").trim()
  return clean.length > limit ? `${clean.slice(0, limit)}...` : clean
}

function jsonLd(value: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, "\\u003c")}</script>`
}

function analyticsProps(value: Record<string, string | number | boolean>): string {
  return escapeAttr(JSON.stringify(value))
}

function trackingScript(): string {
  return `<script>
document.addEventListener("click",function(event){var target=event.target;if(!(target instanceof Element))return;var el=target.closest("[data-analytics-event]");if(!el)return;var name=el.getAttribute("data-analytics-event");if(!name)return;var props={};try{var raw=el.getAttribute("data-analytics-props");if(raw)props=JSON.parse(raw)}catch(e){props={parse_error:true}};var body=JSON.stringify({name:name,props:props,path:location.pathname,ts:new Date().toISOString()});if(navigator.sendBeacon){navigator.sendBeacon("/api/events",new Blob([body],{type:"application/json"}));}else{fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:body,keepalive:true}).catch(function(){});}});
</script>`
}

function pageCss(): string {
  return `:root{color-scheme:light;--bg:#fff8ef;--surface:#fffdf8;--ink:#18181b;--muted:#6f6a60;--line:#e8dccb;--lime:#d7ff4f;--pink:#f7b5c8}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.frame{width:100%;max-width:440px;min-height:100vh;margin:0 auto;padding:16px 20px 40px}.breadcrumbs{font-size:11px;color:var(--muted);margin:0 0 18px}.breadcrumbs ol{display:flex;flex-wrap:wrap;gap:4px;list-style:none;margin:0;padding:0}.breadcrumbs li{display:flex;gap:4px}.breadcrumbs a{color:inherit;text-decoration:none}.article{font-size:13px;line-height:1.85}.eyebrow{margin:0;color:var(--muted);font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase}h1{margin:4px 0 10px;font-size:24px;line-height:1.42;font-weight:900;letter-spacing:0}h2{margin:30px 0 10px;font-size:17px;line-height:1.45}h3{margin:18px 0 8px;font-size:13px;color:var(--muted)}p{margin:0 0 12px}.lead{color:#4f4a43}.cta-grid{display:grid;gap:8px;margin:18px 0 4px}.button{display:flex;min-height:48px;align-items:center;justify-content:center;border-radius:8px;padding:12px 14px;text-align:center;font-weight:900;text-decoration:none}.primary{background:#17171b;color:var(--lime)}.secondary{border:1px solid var(--line);background:var(--surface);color:#38342f}.card,.choices li,.choice-explanations li,.related-card,.term-grid a,.monetize{border:1px solid var(--line);border-radius:12px;background:rgba(255,253,248,.78)}.card{padding:14px}.important{font-weight:700}.pre{white-space:pre-wrap;overflow-wrap:anywhere}.figures{display:grid;gap:10px;margin-top:12px}.figures img{max-width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:white}.check-list,.choice-explanations{padding-left:18px}.choices{display:grid;gap:8px;list-style:none;margin:0;padding:0}.choices li{padding:12px}.choices .correct{background:#f5ffd0}.choice-label{margin-right:8px;font-weight:900}.badge{display:inline-block;margin-left:8px;border-radius:999px;background:var(--lime);padding:1px 8px;font-size:11px;font-weight:900}.answer{border:1px solid var(--line);border-radius:12px;background:#f5ffd0;padding:14px}.answer h2{margin-top:0}.choice-heading{margin:0 0 4px;font-weight:900}.term-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;list-style:none;margin:0;padding:0}.term-grid a{display:block;padding:10px;text-decoration:none;color:inherit}.term-grid span{display:block;color:var(--muted);font-size:10px}.related-list{display:grid;gap:8px}.related-card{display:block;padding:10px;text-decoration:none;color:inherit}.related-card span{display:block;color:var(--muted);font-size:11px;font-weight:800}.related-card strong{display:block;margin-top:2px;font-size:12px;line-height:1.55}.small-links{display:flex;flex-wrap:wrap;gap:12px;margin-top:14px;font-size:12px}.small-links a{color:inherit;text-decoration:underline}.monetize{margin-top:30px;padding:16px}.monetize h2{margin-top:0}@media (prefers-color-scheme:dark){:root{--bg:#181613;--surface:#24211d;--ink:#f6f1e8;--muted:#b8afa2;--line:#3b352f}body{background:var(--bg);color:var(--ink)}.primary{background:#f6f1e8;color:#17171b}.answer,.choices .correct{color:#17171b}}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;")
}
