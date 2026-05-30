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
    sameAs: [
      "https://apps.apple.com/jp/app/goukaku-itパスポート-過去問/id6774202965",
      "https://apps.apple.com/jp/app/基本情報技術者-過去問/id6770801070",
      "https://apps.apple.com/jp/app/宅建過去問/id6772390931",
    ],
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
    "@type": ["Quiz", "LearningResource"],
    name: i.name,
    description: i.description,
    inLanguage: "ja",
    educationalLevel: "professional",
    learningResourceType: "Practice problem",
    url: i.url,
    numberOfItems: i.numberOfItems,
    about: { "@type": "Thing", name: i.aboutName },
    assesses: i.aboutName,
    teaches: i.aboutName,
    isAccessibleForFree: true,
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
  const wrong = q.correctLabel
    ? q.choices.filter((c) => c.label !== q.correctLabel)
    : q.choices
  const question = {
    "@type": "Question",
    "@id": `${q.url}#question`,
    inLanguage: "ja",
    eduQuestionType: "Multiple choice",
    learningResourceType: "Practice problem",
    name: q.name,
    text: q.text,
    url: q.url,
    answerCount: q.choices.length,
    suggestedAnswer: wrong.map((c) => ({
      "@type": "Answer",
      position: c.label,
      text: c.text,
    })),
    ...(accepted && q.correctLabel
      ? {
          acceptedAnswer: {
            "@type": "Answer",
            position: q.correctLabel,
            text: accepted.text,
            ...(q.explanation
              ? {
                  comment: {
                    "@type": "Comment",
                    text: q.explanation,
                  },
                }
              : {}),
          },
        }
      : {}),
  }
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    inLanguage: "ja",
    name: q.name,
    url: q.url,
    educationalLevel: "professional",
    learningResourceType: "Quiz",
    assesses: q.partOfName ?? q.name,
    hasPart: question,
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

export interface CourseInput {
  name: string
  description: string
  url: string
  aboutName: string
  examYears?: string
  totalQuestions?: number
  credentialName?: string
}

export function courseJsonLd(i: CourseInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: i.name,
    description: i.description,
    url: i.url,
    inLanguage: "ja",
    educationalLevel: "professional",
    about: { "@type": "Thing", name: i.aboutName },
    isAccessibleForFree: true,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "学習者",
      audienceType: `${i.aboutName} 受験者・受験予定者`,
    },
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      sameAs: [SITE_URL],
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
      category: "Free",
      availability: "https://schema.org/InStock",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT100H",
      inLanguage: "ja",
      ...(i.examYears ? { description: `収録: ${i.examYears}` } : {}),
    },
    ...(i.credentialName
      ? {
          educationalCredentialAwarded: {
            "@type": "EducationalOccupationalCredential",
            name: i.credentialName,
            credentialCategory: "professional certification",
          },
        }
      : {}),
    ...(i.totalQuestions
      ? {
          numberOfCredits: i.totalQuestions,
          syllabusSections: [
            {
              "@type": "Syllabus",
              name: "過去問演習",
              description: `合計 ${i.totalQuestions} 問 (各設問に解説・選択肢別解説付き)`,
            },
          ],
        }
      : {}),
  }
}

export interface CollectionPageInput {
  name: string
  description: string
  url: string
  items: { name: string; url: string }[]
}

export function collectionPageJsonLd(i: CollectionPageInput) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: i.name,
    description: i.description,
    url: i.url,
    inLanguage: "ja",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: i.items.length,
      itemListElement: i.items.map((it, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: it.name,
        url: it.url,
      })),
    },
  }
}
