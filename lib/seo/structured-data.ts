export const SITE_URL = "https://goukaku.dev"
export const SITE_NAME = "合格.dev"

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "ゴウカクドットデブ",
    url: SITE_URL,
    inLanguage: "ja",
    description:
      "基本情報技術者試験・ITパスポート・宅地建物取引士など、各種資格の過去問を無料で。解説・選択肢別解説・模試モード付き。",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/glossary?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    sameAs: ["https://apps.apple.com/jp/app/id6753257968"],
  }
}

export interface BreadcrumbItem { name: string; url: string }

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  }
}

export interface LearningResourceInput {
  name: string; description: string; url: string;
  numberOfItems: number; aboutName: string;
}

export function learningResourceJsonLd(i: LearningResourceInput) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: i.name,
    description: i.description,
    inLanguage: "ja",
    educationalLevel: "professional",
    learningResourceType: "Quiz",
    url: i.url,
    numberOfItems: i.numberOfItems,
    about: { "@type": "Thing", name: i.aboutName },
  }
}

export interface QuestionInput {
  name: string; text: string; url: string;
  choices: { label: string; text: string }[];
  correctLabel?: string;
  explanation?: string;
  partOfName?: string; partOfUrl?: string;
}

export function questionJsonLd(q: QuestionInput) {
  const accepted = q.correctLabel
    ? q.choices.find((c) => c.label === q.correctLabel)
    : undefined
  return {
    "@context": "https://schema.org",
    "@type": "Question",
    inLanguage: "ja",
    name: q.name,
    text: q.text,
    url: q.url,
    answerCount: q.choices.length,
    suggestedAnswer: q.choices.map((c) => ({
      "@type": "Answer",
      text: `${c.label}: ${c.text}`,
    })),
    ...(accepted && q.correctLabel
      ? {
          acceptedAnswer: {
            "@type": "Answer",
            text: `${q.correctLabel}: ${accepted.text}`,
            ...(q.explanation ? { abstract: q.explanation } : {}),
          },
        }
      : {}),
    ...(q.partOfName && q.partOfUrl
      ? {
          isPartOf: {
            "@type": "LearningResource",
            name: q.partOfName,
            url: q.partOfUrl,
          },
        }
      : {}),
  }
}

export interface ItemListEntry { name: string; url: string }

export function itemListJsonLd(items: ItemListEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  }
}

export interface WebPageInput { name: string; url: string; description: string }

export function webPageJsonLd(i: WebPageInput) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: i.name,
    url: i.url,
    description: i.description,
    inLanguage: "ja",
  }
}
