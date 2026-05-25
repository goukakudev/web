# SEO Phase 1: Technical Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a consistent technical SEO baseline across all routes — OG images for every page, structured data (JSON-LD) parity between FE/IP and takken, a breadcrumb component, split sitemap, and a small shared helper layer.

**Architecture:** A new `lib/seo/` directory holds pure helpers (metadata builder, JSON-LD builders, OG image renderer, related-content algorithms). A new `components/seo/` directory holds React components (Breadcrumbs, JsonLd wrapper). Each existing page is refactored to use these helpers; takken pages are brought up to FE/IP parity. The single-file `app/sitemap.ts` is replaced with a `generateSitemaps`-based multi-file sitemap.

**Tech Stack:** Next.js 16.2.6 (App Router) + React 19, TypeScript, Tailwind v4, Vitest + Testing Library, `next/og` for OG images.

**Source spec:** `docs/superpowers/specs/2026-05-25-seo-optimization-design.md` (sections 1–3, 7.1 partial)

---

## File Map

### New files
| File | Responsibility |
|---|---|
| `lib/seo/metadata.ts` | `makeMetadata({title, description, path, type?, ogImagePath?})` — single canonical metadata builder |
| `lib/seo/structured-data.ts` | JSON-LD builders: `websiteJsonLd`, `organizationJsonLd`, `breadcrumbJsonLd`, `learningResourceJsonLd`, `questionJsonLd`, `examItemListJsonLd` |
| `lib/seo/og.ts` | `renderOgImage({title, subtitle, badge, accent?})` returning `ImageResponse`. Plus shared font loader |
| `components/seo/JsonLd.tsx` | `<JsonLd data={...} />` — script tag wrapper |
| `components/seo/Breadcrumbs.tsx` | `<Breadcrumbs items={[{name, href}, ...]}/>` — visual UL + Breadcrumb JSON-LD |
| `app/opengraph-image.tsx` | Root OG (合格.dev tagline) |
| `app/fe/opengraph-image.tsx` | FE landing OG |
| `app/ip/opengraph-image.tsx` | IP landing OG |
| `app/takken/opengraph-image.tsx` | Takken landing OG |
| `app/fe/exam/[examId]/opengraph-image.tsx` | FE exam detail dynamic OG |
| `app/ip/exam/[examId]/opengraph-image.tsx` | IP exam detail dynamic OG |
| `app/takken/exams/[examId]/opengraph-image.tsx` | Takken exam detail dynamic OG |
| `app/fe/play/[examId]/q/[qNumber]/opengraph-image.tsx` | FE question dynamic OG |
| `app/ip/play/[examId]/q/[qNumber]/opengraph-image.tsx` | IP question dynamic OG |
| `app/takken/exams/[examId]/quiz/opengraph-image.tsx` | Takken quiz dynamic OG |
| `app/fe/tag/[tag]/opengraph-image.tsx` | FE tag dynamic OG |
| `tests/lib/seo/metadata.test.ts` | Tests for `makeMetadata` |
| `tests/lib/seo/structured-data.test.ts` | Tests for JSON-LD builders |
| `tests/components/seo/Breadcrumbs.test.tsx` | Tests for Breadcrumbs |
| `tests/app/sitemap.test.ts` | Tests for split sitemap output |

### Modified files (Takken parity & helper integration)
- `app/takken/page.tsx` — canonical, OG, WebPage JSON-LD, Breadcrumb
- `app/takken/exams/page.tsx` — metadata + ItemList JSON-LD + Breadcrumb
- `app/takken/exams/[examId]/page.tsx` — `generateMetadata` + LearningResource JSON-LD + Breadcrumb
- `app/takken/exams/[examId]/quiz/page.tsx` — Question JSON-LD + Breadcrumb
- `app/takken/categories/page.tsx` — metadata + ItemList + Breadcrumb
- `app/takken/categories/[cat]/page.tsx` — `generateMetadata` + Breadcrumb
- `app/takken/categories/[cat]/quiz/page.tsx` — Question JSON-LD + Breadcrumb
- `app/takken/search/page.tsx` — `noindex`
- `app/takken/bookmarks/page.tsx` — `noindex`
- `app/takken/wrong/page.tsx` — `noindex`
- `app/takken/stats/page.tsx` — `noindex`
- `app/fe/exam/[examId]/page.tsx` — use helpers
- `app/fe/play/[examId]/q/[qNumber]/page.tsx` — use helpers
- `app/fe/tag/[tag]/page.tsx` — use helpers
- `app/ip/exam/[examId]/page.tsx` — use helpers
- `app/ip/play/[examId]/q/[qNumber]/page.tsx` — use helpers
- `app/about/page.tsx`, `app/contact/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/support/page.tsx` — add Breadcrumbs
- `app/sitemap.ts` — full rewrite with `generateSitemaps`
- `app/robots.ts` — adjust disallow list
- `tests/app/robots.test.ts` — match new disallow list

### Touched-but-not-rewritten
- `app/layout.tsx` — extract `websiteJsonLd` / `organizationJsonLd` to helper, no behavior change

---

## Task 1: Add `makeMetadata` helper

**Files:**
- Create: `lib/seo/metadata.ts`
- Test: `tests/lib/seo/metadata.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/seo/metadata.test.ts
import { describe, expect, it } from "vitest"
import { makeMetadata } from "@/lib/seo/metadata"

describe("makeMetadata", () => {
  it("sets title, description, and absolute canonical via metadataBase", () => {
    const md = makeMetadata({
      title: "基本情報技術者試験 過去問",
      description: "13 年分の過去問を無料で。",
      path: "/fe",
    })
    expect(md.title).toBe("基本情報技術者試験 過去問")
    expect(md.description).toBe("13 年分の過去問を無料で。")
    expect(md.alternates).toEqual({ canonical: "/fe" })
  })

  it("populates OpenGraph with type 'website' by default", () => {
    const md = makeMetadata({
      title: "T",
      description: "D",
      path: "/x",
    })
    expect(md.openGraph).toMatchObject({
      type: "website",
      title: "T",
      description: "D",
      url: "/x",
      locale: "ja_JP",
    })
  })

  it("uses 'article' OpenGraph type when requested", () => {
    const md = makeMetadata({
      title: "T",
      description: "D",
      path: "/x",
      type: "article",
    })
    expect(md.openGraph).toMatchObject({ type: "article" })
  })

  it("populates Twitter card", () => {
    const md = makeMetadata({
      title: "T",
      description: "D",
      path: "/x",
    })
    expect(md.twitter).toMatchObject({
      card: "summary_large_image",
      title: "T",
      description: "D",
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run tests/lib/seo/metadata.test.ts
```
Expected: FAIL with "Cannot find module '@/lib/seo/metadata'".

- [ ] **Step 3: Implement `makeMetadata`**

```ts
// lib/seo/metadata.ts
import type { Metadata } from "next"

export interface MakeMetadataInput {
  title: string
  description: string
  path: string
  type?: "website" | "article"
  ogImagePath?: string
}

export function makeMetadata({
  title,
  description,
  path,
  type = "website",
  ogImagePath,
}: MakeMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title,
      description,
      url: path,
      locale: "ja_JP",
      ...(ogImagePath ? { images: [{ url: ogImagePath }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImagePath ? { images: [ogImagePath] } : {}),
    },
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```
npx vitest run tests/lib/seo/metadata.test.ts
```
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/seo/metadata.ts tests/lib/seo/metadata.test.ts
git commit -m "feat(seo): add makeMetadata helper"
```

---

## Task 2: JSON-LD builders

**Files:**
- Create: `lib/seo/structured-data.ts`
- Test: `tests/lib/seo/structured-data.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/seo/structured-data.test.ts
import { describe, expect, it } from "vitest"
import {
  websiteJsonLd,
  organizationJsonLd,
  breadcrumbJsonLd,
  learningResourceJsonLd,
  questionJsonLd,
  itemListJsonLd,
  webPageJsonLd,
} from "@/lib/seo/structured-data"

describe("structured-data", () => {
  it("websiteJsonLd includes SearchAction potentialAction", () => {
    const d = websiteJsonLd()
    expect(d["@type"]).toBe("WebSite")
    expect(d.url).toBe("https://goukaku.dev")
    expect(d.potentialAction["@type"]).toBe("SearchAction")
  })

  it("organizationJsonLd includes sameAs and logo", () => {
    const d = organizationJsonLd()
    expect(d["@type"]).toBe("Organization")
    expect(d.logo).toMatch(/^https:\/\//)
    expect(Array.isArray(d.sameAs)).toBe(true)
  })

  it("breadcrumbJsonLd assigns positions in order", () => {
    const d = breadcrumbJsonLd([
      { name: "合格.dev", url: "https://goukaku.dev/" },
      { name: "基本情報技術者試験", url: "https://goukaku.dev/fe" },
    ])
    expect(d.itemListElement[0].position).toBe(1)
    expect(d.itemListElement[1].position).toBe(2)
    expect(d.itemListElement[1].name).toBe("基本情報技術者試験")
  })

  it("learningResourceJsonLd populates required fields", () => {
    const d = learningResourceJsonLd({
      name: "令和5年春 FE 午前",
      description: "過去問80問",
      url: "https://goukaku.dev/fe/exam/r5h",
      numberOfItems: 80,
      aboutName: "基本情報技術者試験",
    })
    expect(d["@type"]).toBe("LearningResource")
    expect(d.numberOfItems).toBe(80)
    expect(d.about.name).toBe("基本情報技術者試験")
  })

  it("questionJsonLd packs acceptedAnswer when correctLabel given", () => {
    const d = questionJsonLd({
      name: "FE r5h 問1",
      text: "本文",
      url: "https://goukaku.dev/fe/play/r5h/q/1",
      choices: [
        { label: "ア", text: "A" },
        { label: "イ", text: "B" },
      ],
      correctLabel: "ア",
      partOfName: "令和5年春 FE 過去問",
      partOfUrl: "https://goukaku.dev/fe/exam/r5h",
    })
    expect(d["@type"]).toBe("Question")
    expect(d.acceptedAnswer.text).toBe("ア: A")
    expect(d.answerCount).toBe(2)
    expect(d.isPartOf.url).toBe("https://goukaku.dev/fe/exam/r5h")
  })

  it("itemListJsonLd produces positioned items", () => {
    const d = itemListJsonLd([
      { name: "宅建", url: "https://goukaku.dev/takken" },
      { name: "FE", url: "https://goukaku.dev/fe" },
    ])
    expect(d["@type"]).toBe("ItemList")
    expect(d.itemListElement).toHaveLength(2)
    expect(d.itemListElement[0]).toMatchObject({
      "@type": "ListItem",
      position: 1,
      url: "https://goukaku.dev/takken",
      name: "宅建",
    })
  })

  it("webPageJsonLd has name and url", () => {
    const d = webPageJsonLd({
      name: "宅地建物取引士 過去問",
      url: "https://goukaku.dev/takken",
      description: "宅建の過去問",
    })
    expect(d["@type"]).toBe("WebPage")
    expect(d.url).toBe("https://goukaku.dev/takken")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run tests/lib/seo/structured-data.test.ts
```
Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Implement builders**

```ts
// lib/seo/structured-data.ts
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

export interface BreadcrumbItem {
  name: string
  url: string
}

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
  name: string
  description: string
  url: string
  numberOfItems: number
  aboutName: string
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
  name: string
  text: string
  url: string
  choices: { label: string; text: string }[]
  correctLabel?: string
  explanation?: string
  partOfName?: string
  partOfUrl?: string
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

export interface ItemListEntry {
  name: string
  url: string
}

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

export interface WebPageInput {
  name: string
  url: string
  description: string
}

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
```

- [ ] **Step 4: Run test to verify it passes**

```
npx vitest run tests/lib/seo/structured-data.test.ts
```
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/seo/structured-data.ts tests/lib/seo/structured-data.test.ts
git commit -m "feat(seo): add JSON-LD structured-data builders"
```

---

## Task 3: `JsonLd` component

**Files:**
- Create: `components/seo/JsonLd.tsx`

(No new test — covered by snapshot tests of pages that use it.)

- [ ] **Step 1: Implement**

```tsx
// components/seo/JsonLd.tsx
import * as React from "react"

export interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data)
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
```

- [ ] **Step 2: Type-check**

```
npm run typecheck
```
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/seo/JsonLd.tsx
git commit -m "feat(seo): add JsonLd component wrapper"
```

---

## Task 4: `Breadcrumbs` component

**Files:**
- Create: `components/seo/Breadcrumbs.tsx`
- Test: `tests/components/seo/Breadcrumbs.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/seo/Breadcrumbs.test.tsx
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

describe("Breadcrumbs", () => {
  const items = [
    { name: "合格.dev", href: "/" },
    { name: "基本情報技術者試験", href: "/fe" },
    { name: "令和5年春", href: "/fe/exam/r5h" },
  ]

  it("renders visual list with links for non-last items", () => {
    render(<Breadcrumbs items={items} />)
    expect(screen.getByRole("link", { name: "合格.dev" })).toHaveAttribute(
      "href",
      "/",
    )
    expect(
      screen.getByRole("link", { name: "基本情報技術者試験" }),
    ).toHaveAttribute("href", "/fe")
    expect(screen.getByText("令和5年春")).toBeInTheDocument()
    // last item is not a link
    expect(screen.queryByRole("link", { name: "令和5年春" })).toBeNull()
  })

  it("emits BreadcrumbList JSON-LD with absolute URLs", () => {
    const { container } = render(<Breadcrumbs items={items} />)
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    )
    expect(script).not.toBeNull()
    const data = JSON.parse(script!.textContent!)
    expect(data["@type"]).toBe("BreadcrumbList")
    expect(data.itemListElement[0].item).toBe("https://goukaku.dev/")
    expect(data.itemListElement[2].item).toBe(
      "https://goukaku.dev/fe/exam/r5h",
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run tests/components/seo/Breadcrumbs.test.tsx
```
Expected: FAIL with "Cannot find module '@/components/seo/Breadcrumbs'".

- [ ] **Step 3: Implement**

```tsx
// components/seo/Breadcrumbs.tsx
import Link from "next/link"
import * as React from "react"
import {
  absoluteUrl,
  breadcrumbJsonLd,
} from "@/lib/seo/structured-data"
import { JsonLd } from "./JsonLd"

export interface BreadcrumbsProps {
  items: { name: string; href: string }[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null
  return (
    <>
      <nav
        aria-label="パンくず"
        className="text-[11px] text-goukaku-ink/60 mb-4"
      >
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, i) => (
            <li key={`${item.href}-${i}`} className="flex items-center gap-1">
              {i < items.length - 1 ? (
                <Link href={item.href} className="hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="font-bold">
                  {item.name}
                </span>
              )}
              {i < items.length - 1 && <span aria-hidden>›</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={breadcrumbJsonLd(
          items.map((it) => ({ name: it.name, url: absoluteUrl(it.href) })),
        )}
      />
    </>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```
npx vitest run tests/components/seo/Breadcrumbs.test.tsx
```
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add components/seo/Breadcrumbs.tsx tests/components/seo/Breadcrumbs.test.tsx
git commit -m "feat(seo): add Breadcrumbs component with JSON-LD"
```

---

## Task 5: OG image render helper

**Files:**
- Create: `lib/seo/og.ts`

(Visual content; no unit test. Verified by per-route OG tasks via build / browser preview.)

- [ ] **Step 1: Implement**

```tsx
// lib/seo/og.ts
import { ImageResponse } from "next/og"
import type { ReactElement } from "react"

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = "image/png" as const

export interface RenderOgInput {
  title: string
  subtitle?: string
  badge?: string
  accent?: "pink" | "blue" | "charcoal"
}

const ACCENTS = {
  pink: { from: "#FFE4F0", to: "#FFF7FA", ink: "#1F1A1F", tag: "#D62D7B" },
  blue: { from: "#E6F2FF", to: "#F4F9FF", ink: "#0F1A2A", tag: "#0E66A8" },
  charcoal: { from: "#1E1E22", to: "#2A2A30", ink: "#FFFFFF", tag: "#FFD27A" },
} as const

export function renderOgImage(input: RenderOgInput): ImageResponse {
  const accent = ACCENTS[input.accent ?? "pink"]
  const element: ReactElement = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
        color: accent.ink,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        合格.dev
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {input.badge && (
          <div
            style={{
              alignSelf: "flex-start",
              fontSize: 24,
              fontWeight: 700,
              color: accent.tag,
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.65)",
            }}
          >
            {input.badge}
          </div>
        )}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.04em",
          }}
        >
          {input.title}
        </div>
        {input.subtitle && (
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              opacity: 0.8,
              lineHeight: 1.4,
            }}
          >
            {input.subtitle}
          </div>
        )}
      </div>
    </div>
  )
  return new ImageResponse(element, OG_SIZE)
}
```

- [ ] **Step 2: Type-check**

```
npm run typecheck
```
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/seo/og.ts
git commit -m "feat(seo): add OG image render helper"
```

---

## Task 6: Root OG image

**Files:**
- Create: `app/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/opengraph-image.tsx
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "合格.dev — 資格試験の過去問学習"

export default function Image() {
  return renderOgImage({
    title: "資格試験の過去問学習",
    subtitle: "ITパスポート・基本情報技術者・宅地建物取引士",
    badge: "合格.dev",
    accent: "pink",
  })
}
```

- [ ] **Step 2: Verify in build**

```
npm run build
```
Expected: build succeeds, `og` route generated. Visual check: `npm run dev` → open `http://localhost:3000/opengraph-image` in browser.

- [ ] **Step 3: Commit**

```bash
git add app/opengraph-image.tsx
git commit -m "feat(seo): add root OG image"
```

---

## Task 7: `/fe` OG image

**Files:**
- Create: `app/fe/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/fe/opengraph-image.tsx
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "基本情報技術者試験 過去問 + 解説 — 合格.dev"

export default function Image() {
  return renderOgImage({
    title: "基本情報技術者試験 過去問",
    subtitle: "13 年分・全 1,000 問・解説 + 模試モード付き",
    badge: "FE / 基本情報",
    accent: "blue",
  })
}
```

- [ ] **Step 2: Verify**

```
npm run build && npm run dev
```
Visit `http://localhost:3000/fe/opengraph-image`. Should render.

- [ ] **Step 3: Commit**

```bash
git add app/fe/opengraph-image.tsx
git commit -m "feat(seo): add /fe OG image"
```

---

## Task 8: `/ip` OG image

**Files:**
- Create: `app/ip/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/ip/opengraph-image.tsx
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "ITパスポート試験 過去問 + 解説 — 合格.dev"

export default function Image() {
  return renderOgImage({
    title: "ITパスポート試験 過去問",
    subtitle: "29 年分・全 2,900 問・解説 + ヒント付き",
    badge: "IP / ITパスポート",
    accent: "pink",
  })
}
```

- [ ] **Step 2: Verify**

```
npm run build && npm run dev
```
Visit `http://localhost:3000/ip/opengraph-image`.

- [ ] **Step 3: Commit**

```bash
git add app/ip/opengraph-image.tsx
git commit -m "feat(seo): add /ip OG image"
```

---

## Task 9: `/takken` OG image

**Files:**
- Create: `app/takken/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/takken/opengraph-image.tsx
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "宅地建物取引士 過去問 — 合格.dev"

export default function Image() {
  return renderOgImage({
    title: "宅地建物取引士 過去問",
    subtitle: "H16〜R7 まで・全試験・関連条文/判例ポップアップ",
    badge: "宅建",
    accent: "charcoal",
  })
}
```

- [ ] **Step 2: Verify & commit**

```
npm run build
git add app/takken/opengraph-image.tsx
git commit -m "feat(seo): add /takken OG image"
```

---

## Task 10: FE exam-detail dynamic OG image

**Files:**
- Create: `app/fe/exam/[examId]/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/fe/exam/[examId]/opengraph-image.tsx
import { listExams } from "@/lib/api-client"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "FE 過去問"

interface Props {
  params: { examId: string }
}

export default async function Image({ params }: Props) {
  const exams = await listExams()
  const exam = exams.find((e) => e.exam_id === params.examId)
  const label = exam?.title ?? `${exam?.year ?? ""} ${exam?.section ?? ""}`.trim()
  const count = exam?.question_count ?? 80
  return renderOgImage({
    title: label || params.examId,
    subtitle: `基本情報技術者試験 午前 全${count}問・解説付き`,
    badge: "FE 過去問",
    accent: "blue",
  })
}
```

- [ ] **Step 2: Verify in dev**

```
npm run dev
```
Visit `http://localhost:3000/fe/exam/<existing-examId>/opengraph-image` (use an exam_id returned by `listExams`).

- [ ] **Step 3: Commit**

```bash
git add app/fe/exam/[examId]/opengraph-image.tsx
git commit -m "feat(seo): add dynamic OG image for /fe/exam/[examId]"
```

---

## Task 11: IP exam-detail dynamic OG image

**Files:**
- Create: `app/ip/exam/[examId]/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/ip/exam/[examId]/opengraph-image.tsx
import { listIpExams } from "@/lib/api-client"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "IP 過去問"

interface Props {
  params: { examId: string }
}

export default async function Image({ params }: Props) {
  const exams = await listIpExams()
  const exam = exams.find((e) => e.exam_id === params.examId)
  const label = exam?.title ?? `${exam?.year ?? ""} ${exam?.section ?? ""}`.trim()
  const count = exam?.question_count ?? 100
  return renderOgImage({
    title: label || params.examId,
    subtitle: `ITパスポート試験 全${count}問・解説/ヒント付き`,
    badge: "IP 過去問",
    accent: "pink",
  })
}
```

- [ ] **Step 2: Verify & commit**

```
npm run dev
```
Visit one IP exam OG URL.

```bash
git add app/ip/exam/[examId]/opengraph-image.tsx
git commit -m "feat(seo): add dynamic OG image for /ip/exam/[examId]"
```

---

## Task 12: Takken exam-detail dynamic OG image

**Files:**
- Create: `app/takken/exams/[examId]/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/takken/exams/[examId]/opengraph-image.tsx
import { TakkenAPI } from "@/lib/takken/api"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "宅建 過去問"

interface Props {
  params: { examId: string }
}

export default async function Image({ params }: Props) {
  const exam = await TakkenAPI.getExam(params.examId)
  const label = exam?.label ?? params.examId
  const count = exam?.question_count ?? 50
  return renderOgImage({
    title: `${label} 宅建過去問`,
    subtitle: `全${count}問・関連条文/判例ポップアップ表示`,
    badge: "宅建 過去問",
    accent: "charcoal",
  })
}
```

- [ ] **Step 2: Verify & commit**

```
npm run dev
```
Visit a takken exam OG URL.

```bash
git add app/takken/exams/[examId]/opengraph-image.tsx
git commit -m "feat(seo): add dynamic OG image for /takken/exams/[examId]"
```

---

## Task 13: FE question dynamic OG image

**Files:**
- Create: `app/fe/play/[examId]/q/[qNumber]/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/fe/play/[examId]/q/[qNumber]/opengraph-image.tsx
import { listExams, listQuestions } from "@/lib/api-client"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "FE 過去問 問題"

interface Props {
  params: { examId: string; qNumber: string }
}

function stripMd(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default async function Image({ params }: Props) {
  const n = Number(params.qNumber)
  const [exams, questions] = await Promise.all([
    listExams(),
    listQuestions(params.examId).catch(() => []),
  ])
  const exam = exams.find((e) => e.exam_id === params.examId)
  const q = questions.find((q) => q.q_number === n)
  const label = exam?.title ?? params.examId
  const preview = q ? stripMd(q.body).slice(0, 80) : ""
  return renderOgImage({
    title: `問${n}`,
    subtitle: preview || label,
    badge: `${label} / FE`,
    accent: "blue",
  })
}
```

- [ ] **Step 2: Verify & commit**

```
npm run dev
```
Visit a question OG URL.

```bash
git add app/fe/play/[examId]/q/[qNumber]/opengraph-image.tsx
git commit -m "feat(seo): add dynamic OG image for FE question pages"
```

---

## Task 14: IP question dynamic OG image

**Files:**
- Create: `app/ip/play/[examId]/q/[qNumber]/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/ip/play/[examId]/q/[qNumber]/opengraph-image.tsx
import { listIpExams, listIpQuestions } from "@/lib/api-client"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "IP 過去問 問題"

interface Props {
  params: { examId: string; qNumber: string }
}

function stripMd(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default async function Image({ params }: Props) {
  const n = Number(params.qNumber)
  const [exams, questions] = await Promise.all([
    listIpExams(),
    listIpQuestions(params.examId).catch(() => []),
  ])
  const exam = exams.find((e) => e.exam_id === params.examId)
  const q = questions.find((q) => q.q_number === n)
  const label = exam?.title ?? params.examId
  const preview = q ? stripMd(q.body).slice(0, 80) : ""
  return renderOgImage({
    title: `問${n}`,
    subtitle: preview || label,
    badge: `${label} / IP`,
    accent: "pink",
  })
}
```

- [ ] **Step 2: Verify & commit**

```
npm run dev
git add app/ip/play/[examId]/q/[qNumber]/opengraph-image.tsx
git commit -m "feat(seo): add dynamic OG image for IP question pages"
```

---

## Task 15: Takken quiz dynamic OG image

**Files:**
- Create: `app/takken/exams/[examId]/quiz/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/takken/exams/[examId]/quiz/opengraph-image.tsx
import { TakkenAPI } from "@/lib/takken/api"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "宅建 過去問 演習"

interface Props {
  params: { examId: string }
}

export default async function Image({ params }: Props) {
  const exam = await TakkenAPI.getExam(params.examId)
  const label = exam?.label ?? params.examId
  return renderOgImage({
    title: `${label} 宅建 演習`,
    subtitle: `全${exam?.question_count ?? 50}問を順番に解く`,
    badge: "宅建 / 演習",
    accent: "charcoal",
  })
}
```

- [ ] **Step 2: Verify & commit**

```
npm run dev
git add app/takken/exams/[examId]/quiz/opengraph-image.tsx
git commit -m "feat(seo): add dynamic OG image for takken quiz pages"
```

---

## Task 16: FE tag dynamic OG image

**Files:**
- Create: `app/fe/tag/[tag]/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/fe/tag/[tag]/opengraph-image.tsx
import { slugToTag } from "@/lib/tag-url"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "FE タグ別過去問"

interface Props {
  params: { tag: string }
}

export default async function Image({ params }: Props) {
  const tag = slugToTag(params.tag).replace(/^#/, "")
  return renderOgImage({
    title: `#${tag}`,
    subtitle: "基本情報技術者試験 タグ別過去問",
    badge: "FE / タグ",
    accent: "blue",
  })
}
```

- [ ] **Step 2: Verify & commit**

```
npm run dev
git add app/fe/tag/[tag]/opengraph-image.tsx
git commit -m "feat(seo): add dynamic OG image for FE tag pages"
```

---

## Task 17: Refactor `app/layout.tsx` to share JSON-LD helpers

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Edit layout to import helpers**

Replace the inline `websiteJsonLd` / `organizationJsonLd` constants with calls to `lib/seo/structured-data`:

```tsx
// app/layout.tsx (top of file, additions/replacements)
import {
  websiteJsonLd,
  organizationJsonLd,
} from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
```

Delete the two const definitions and replace the two `<script type="application/ld+json">` tags in the body with:

```tsx
<JsonLd data={websiteJsonLd()} />
<JsonLd data={organizationJsonLd()} />
```

- [ ] **Step 2: Verify**

```
npm run typecheck && npm run test -- tests/app
```
Expected: typecheck passes, no test regressions.

Manually open `http://localhost:3000/` in dev and inspect HTML — both `application/ld+json` script tags still appear with the same shape.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "refactor(seo): use shared JSON-LD helpers in root layout"
```

---

## Task 18: Takken landing — full SEO parity

**Files:**
- Modify: `app/takken/page.tsx`

- [ ] **Step 1: Implementation**

Replace the existing `metadata` export and add Breadcrumbs + WebPage JSON-LD:

```tsx
// app/takken/page.tsx (top imports — add)
import { makeMetadata } from "@/lib/seo/metadata"
import { webPageJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

// Replace the existing `export const metadata` with:
export const metadata = makeMetadata({
  title: "宅建士 過去問",
  description:
    "宅地建物取引士(宅建士)試験の過去問演習サイト。H16〜R7 の全試験・1,200 問以上を解説付きで掲載。関連条文・判例タップで本文ポップアップ表示。",
  path: "/takken",
})
```

**Replace** the existing manual `<nav>...</nav>` block (lines starting `<nav className="mb-8 text-xs tracking-widest text-ink-3">` through its closing `</nav>`) with:

```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "宅建", href: "/takken" },
]} />
<JsonLd
  data={webPageJsonLd({
    name: "宅地建物取引士 過去問",
    url: "https://goukaku.dev/takken",
    description:
      "宅地建物取引士(宅建士)試験の過去問演習サイト。H16〜R7 の全試験を解説付きで。",
  })}
/>
```

(The Breadcrumbs component renders visually, so the old manual nav becomes a duplicate.)

- [ ] **Step 2: Verify**

```
npm run typecheck && npm run dev
```
Open `http://localhost:3000/takken`, inspect DOM: canonical link, OG meta, two `application/ld+json` scripts (WebPage + Breadcrumb).

- [ ] **Step 3: Commit**

```bash
git add app/takken/page.tsx
git commit -m "feat(seo): bring /takken landing to SEO parity (canonical, OG, JSON-LD, breadcrumbs)"
```

---

## Task 19: Takken exams index — metadata & ItemList JSON-LD

**Files:**
- Modify: `app/takken/exams/page.tsx`

- [ ] **Step 1: Read current page** to understand its shape:

```
cat app/takken/exams/page.tsx
```

- [ ] **Step 2: Add metadata + breadcrumbs + ItemList JSON-LD**

Add at top:
```tsx
import { makeMetadata } from "@/lib/seo/metadata"
import { itemListJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { TakkenAPI } from "@/lib/takken/api"

export const metadata = makeMetadata({
  title: "宅建 年度別過去問",
  description: "宅地建物取引士試験の過去問を年度別に。H16〜R7 までの全試験を掲載。",
  path: "/takken/exams",
})
```

Inside the page component, **replace** the existing manual `<nav>...</nav>` block with:
```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "宅建", href: "/takken" },
  { name: "年度別", href: "/takken/exams" },
]} />
<JsonLd
  data={itemListJsonLd(
    exams.map((e) => ({
      name: `${e.label} 宅建過去問`,
      url: `https://goukaku.dev/takken/exams/${e.exam_id}`,
    })),
  )}
/>
```

- [ ] **Step 3: Verify**

```
npm run typecheck && npm run dev
```
Visit `/takken/exams`, inspect DOM.

- [ ] **Step 4: Commit**

```bash
git add app/takken/exams/page.tsx
git commit -m "feat(seo): add metadata, breadcrumbs, ItemList JSON-LD to /takken/exams"
```

---

## Task 20: Takken exam detail — generateMetadata + LearningResource

**Files:**
- Modify: `app/takken/exams/[examId]/page.tsx`

- [ ] **Step 1: Add generateMetadata, breadcrumbs, JSON-LD**

```tsx
// app/takken/exams/[examId]/page.tsx — add at top
import type { Metadata } from "next"
import { makeMetadata } from "@/lib/seo/metadata"
import { learningResourceJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { TakkenAPI } from "@/lib/takken/api"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ examId: string }>
}): Promise<Metadata> {
  const { examId } = await params
  const exam = await TakkenAPI.getExam(examId)
  if (!exam) return {}
  const title = `${exam.label} 宅建過去問 ${exam.question_count} 問`
  const description = `宅地建物取引士試験 ${exam.label} の過去問 ${exam.question_count} 問。関連条文・判例タップで本文ポップアップ表示・解説付き。`
  return makeMetadata({
    title,
    description,
    path: `/takken/exams/${exam.exam_id}`,
  })
}
```

Inside the rendered JSX (top of main content area, after fetching `exam`):

```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "宅建", href: "/takken" },
  { name: "年度別", href: "/takken/exams" },
  { name: exam.label, href: `/takken/exams/${exam.exam_id}` },
]} />
<JsonLd
  data={learningResourceJsonLd({
    name: `${exam.label} 宅建過去問`,
    description: `宅地建物取引士試験 ${exam.label} 全 ${exam.question_count} 問・解説付き`,
    url: `https://goukaku.dev/takken/exams/${exam.exam_id}`,
    numberOfItems: exam.question_count,
    aboutName: "宅地建物取引士試験",
  })}
/>
```

- [ ] **Step 2: Verify**

```
npm run typecheck && npm run dev
```
Visit `/takken/exams/<some examId>`. Inspect metadata + JSON-LD.

- [ ] **Step 3: Commit**

```bash
git add app/takken/exams/[examId]/page.tsx
git commit -m "feat(seo): add metadata + LearningResource JSON-LD to /takken/exams/[examId]"
```

---

## Task 21: Takken quiz page — Question JSON-LD + Breadcrumbs

**Files:**
- Modify: `app/takken/exams/[examId]/quiz/page.tsx`

**Pre-read context:** The current page (file is short, 23 lines) is a thin server-component wrapper that fetches `TakkenAPI.listExamQuestions(examId)` then hands everything to a client component `QuizClient`. There is no per-question server rendering, no `current` variable, and no `generateMetadata`. Question navigation happens client-side. URLs of the form `?q={N}` are emitted by the SPA but the server does not branch on them.

Per the spec, we want each `?q=N` URL to be SEO-discoverable. For Phase 1 we add server-side fetch of the specific question whose number matches `?q`, emit per-question metadata + Question JSON-LD, and leave the visual quiz behavior unchanged (the client component still runs the SPA).

- [ ] **Step 1: Replace the file contents**

Full new contents:

```tsx
// app/takken/exams/[examId]/quiz/page.tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { TakkenAPI } from "@/lib/takken/api"
import { makeMetadata } from "@/lib/seo/metadata"
import { questionJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import QuizClient from "./QuizClient"

type Props = {
  params: Promise<{ examId: string }>
  searchParams: Promise<{ mode?: "exam" | "instant"; q?: string }>
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { examId } = await params
  const { q } = await searchParams
  const exam = await TakkenAPI.getExam(examId)
  if (!exam) return {}
  const qn = Number(q ?? "1")
  const path =
    q && qn > 1
      ? `/takken/exams/${exam.exam_id}/quiz?q=${qn}`
      : `/takken/exams/${exam.exam_id}/quiz`
  return makeMetadata({
    title: `${exam.label} 宅建 問${qn}`,
    description: `宅地建物取引士試験 ${exam.label} 問${qn} の本文・選択肢・正解・解説。`,
    path,
    type: "article",
  })
}

export default async function QuizPage({ params, searchParams }: Props) {
  const { examId } = await params
  const { mode, q } = await searchParams
  const result = await TakkenAPI.listExamQuestions(examId)
  if (!result || result.questions.length === 0) notFound()
  const exam = await TakkenAPI.getExam(examId)
  const qn = Number(q ?? "1")
  const current =
    result.questions.find((qq) => qq.question_number === qn) ??
    result.questions[0]

  const choices = Object.entries(current.choices).map(([label, text]) => ({
    label,
    text: String(text),
  }))

  return (
    <>
      {exam && (
        <Breadcrumbs
          items={[
            { name: "合格.dev", href: "/" },
            { name: "宅建", href: "/takken" },
            { name: exam.label, href: `/takken/exams/${exam.exam_id}` },
            {
              name: `問${current.question_number}`,
              href: `/takken/exams/${exam.exam_id}/quiz?q=${current.question_number}`,
            },
          ]}
        />
      )}
      <JsonLd
        data={questionJsonLd({
          name: `${exam?.label ?? examId} 宅建 問${current.question_number}`,
          text: current.question_text,
          url: `https://goukaku.dev/takken/exams/${examId}/quiz?q=${current.question_number}`,
          choices,
          correctLabel:
            current.correct_answer != null
              ? String(current.correct_answer)
              : undefined,
          explanation: current.explanation?.commentary ?? undefined,
          partOfName: `${exam?.label ?? examId} 宅建過去問`,
          partOfUrl: `https://goukaku.dev/takken/exams/${examId}`,
        })}
      />
      <QuizClient
        examId={examId}
        questions={result.questions}
        mode={mode === "exam" ? "exam" : "instant"}
      />
    </>
  )
}
```

- [ ] **Step 2: Verify**

```
npm run typecheck && npm run dev
```
Visit `/takken/exams/<id>/quiz?q=1` and `?q=5`. View source — `<title>` and Question JSON-LD reflect the `?q` value. Breadcrumb shows `問N`. Visual quiz still works (QuizClient unchanged).

- [ ] **Step 3: Commit**

```bash
git add app/takken/exams/[examId]/quiz/page.tsx
git commit -m "feat(seo): add Question JSON-LD + breadcrumbs to takken quiz pages"
```

---

## Task 22: Takken categories index & detail — metadata & JSON-LD

**Files:**
- Modify: `app/takken/categories/page.tsx`
- Modify: `app/takken/categories/[cat]/page.tsx`
- Modify: `app/takken/categories/[cat]/quiz/page.tsx`

- [ ] **Step 1: `categories/page.tsx`**

Pre-read context: this file already has `const CATEGORIES = [{name, subtitle, gradient}, ...]` hardcoded (no `slug` field). URLs are built as `/takken/categories/${encodeURIComponent(c.name)}` (Japanese name URL-encoded).

Replace the existing `export const metadata: Metadata = {...}` with:
```tsx
import { makeMetadata } from "@/lib/seo/metadata"
import { itemListJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

export const metadata = makeMetadata({
  title: "宅建 分野別過去問",
  description: "宅地建物取引士試験の過去問を、権利関係 / 宅建業法 / 法令上の制限 / 税その他 の 4 分野別に学習。解説付き。",
  path: "/takken/categories",
})
```

In the JSX, just below the existing `<nav>` and above `<h1>` (keeping both for now — the old `<nav>` is visual decoration, Breadcrumbs adds JSON-LD):
```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "宅建", href: "/takken" },
  { name: "分野別", href: "/takken/categories" },
]} />
<JsonLd
  data={itemListJsonLd(
    CATEGORIES.map((c) => ({
      name: `${c.name} 宅建過去問`,
      url: `https://goukaku.dev/takken/categories/${encodeURIComponent(c.name)}`,
    })),
  )}
/>
```

- [ ] **Step 2: `categories/[cat]/page.tsx`**

Pre-read context: existing file already has `generateMetadata` and a default export that decodes the slug into `decoded`. We extend metadata and replace the manual nav.

Replace the existing `generateMetadata` body with:
```tsx
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params
  const decoded = decodeURIComponent(cat)
  return makeMetadata({
    title: `${decoded} 宅建過去問`,
    description: `宅地建物取引士試験 ${decoded} 分野の過去問演習。出題傾向と頻出論点を解説付きで。`,
    path: `/takken/categories/${cat}`,
  })
}
```

In the default export, **replace** the existing manual `<nav>...</nav>` block with:
```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "宅建", href: "/takken" },
  { name: "分野別", href: "/takken/categories" },
  { name: decoded, href: `/takken/categories/${cat}` },
]} />
```

- [ ] **Step 3: `categories/[cat]/quiz/page.tsx`**

Pre-read context: this page randomly samples questions on every load (when `?count=` is set). There is no single "current question" tied to the URL, so per-question `questionJsonLd` is inappropriate — emit `WebPage` metadata + Breadcrumbs only. Set canonical to the no-query variant so `?count=` variants don't fragment SEO weight.

Replace the file contents with:

```tsx
// app/takken/categories/[cat]/quiz/page.tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { TakkenAPI } from "@/lib/takken/api"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import QuizClient from "../../../exams/[examId]/quiz/QuizClient"

type Props = {
  params: Promise<{ cat: string }>
  searchParams: Promise<{ count?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params
  const decoded = decodeURIComponent(cat)
  return makeMetadata({
    title: `${decoded} 宅建 分野別演習`,
    description: `宅地建物取引士試験 ${decoded} 分野の過去問演習。ランダム出題で実力チェック。`,
    path: `/takken/categories/${cat}/quiz`,
  })
}

export default async function CategoryQuizPage({ params, searchParams }: Props) {
  const { cat } = await params
  const { count } = await searchParams
  const decoded = decodeURIComponent(cat)
  const data = await TakkenAPI.listCategoryQuestions(decoded)
  if (data.count === 0) notFound()

  let questions = data.questions
  if (count) {
    const n = parseInt(count, 10)
    if (!Number.isNaN(n) && n > 0 && n < questions.length) {
      questions = [...questions].sort(() => Math.random() - 0.5).slice(0, n)
    }
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "合格.dev", href: "/" },
          { name: "宅建", href: "/takken" },
          { name: "分野別", href: "/takken/categories" },
          { name: decoded, href: `/takken/categories/${cat}` },
          { name: "演習", href: `/takken/categories/${cat}/quiz` },
        ]}
      />
      <QuizClient
        examId={`cat-${decoded}`}
        questions={questions}
        mode="instant"
      />
    </>
  )
}
```

- [ ] **Step 4: Verify**

```
npm run typecheck && npm run dev
```
Visit each of the 3 pages, inspect.

- [ ] **Step 5: Commit**

```bash
git add app/takken/categories/page.tsx app/takken/categories/[cat]/page.tsx app/takken/categories/[cat]/quiz/page.tsx
git commit -m "feat(seo): add metadata, breadcrumbs, JSON-LD to takken category pages"
```

---

## Task 23: Mark takken local-only pages as noindex

**Files:**
- Modify: `app/takken/search/page.tsx`
- Modify: `app/takken/bookmarks/page.tsx`
- Modify: `app/takken/wrong/page.tsx`
- Modify: `app/takken/stats/page.tsx`

**Pre-read context:** All four pages already have `export const metadata: Metadata = { title: ..., description: ... }` at the top of the file. We merge `robots` into the existing object — do not duplicate.

- [ ] **Step 1: For each of the 4 files, add a `robots` property to the existing `metadata` object**

Example (the change is the same in all 4):

```tsx
// before
export const metadata: Metadata = {
  title: "検索 — 宅建",
  description: "宅建士試験 過去問の全文検索",
};

// after
export const metadata: Metadata = {
  title: "検索 — 宅建",
  description: "宅建士試験 過去問の全文検索",
  robots: { index: false, follow: true },
};
```

Apply the identical `robots: { index: false, follow: true }` addition to each of `search/page.tsx`, `bookmarks/page.tsx`, `wrong/page.tsx`, `stats/page.tsx`.

- [ ] **Step 2: Verify**

```
npm run typecheck && npm run dev
```
Visit each page, inspect `<meta name="robots" content="noindex,follow" />`.

- [ ] **Step 3: Commit**

```bash
git add app/takken/search/page.tsx app/takken/bookmarks/page.tsx app/takken/wrong/page.tsx app/takken/stats/page.tsx
git commit -m "feat(seo): noindex takken local-only pages (search/bookmarks/wrong/stats)"
```

---

## Task 24: Refactor FE exam-detail to use helpers

**Files:**
- Modify: `app/fe/exam/[examId]/page.tsx`

- [ ] **Step 1: Replace inline metadata + JSON-LD with helpers**

Replace the current `generateMetadata` body:
```tsx
import { makeMetadata } from "@/lib/seo/metadata"
import { learningResourceJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { examId } = await params
  const exams = await listExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) return {}
  const examLabel = exam.title ?? `${exam.year} ${exam.section}`
  const title = `${examLabel} ${exam.exam} 過去問 ${exam.question_count} 問`
  const description = `基本情報技術者試験 ${examLabel} 午前の過去問 ${exam.question_count} 問。順番・ランダム・模試 (90 分) の 3 モードで解け、全問に解説と選択肢ごとの正誤解説が付きます。`
  return makeMetadata({
    title,
    description,
    path: `/fe/exam/${exam.exam_id}`,
  })
}
```

Replace the inline `jsonLd` const + `<script>` with `<JsonLd data={learningResourceJsonLd({...})} />`. Add `<Breadcrumbs items={...} />` just above the existing `<Link href="/fe">← ホーム</Link>`.

```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "基本情報技術者試験", href: "/fe" },
  { name: examLabel, href: `/fe/exam/${exam.exam_id}` },
]} />
<JsonLd
  data={learningResourceJsonLd({
    name: `${examLabel} ${exam.exam} 過去問`,
    description: `基本情報技術者試験 ${examLabel} 午前の過去問 ${exam.question_count} 問・解説付き`,
    url: `https://goukaku.dev/fe/exam/${exam.exam_id}`,
    numberOfItems: exam.question_count,
    aboutName: "基本情報技術者試験",
  })}
/>
```

- [ ] **Step 2: Verify**

```
npm run typecheck && npm run test
```
Visit `/fe/exam/<some examId>`, confirm same metadata + Breadcrumb appears.

- [ ] **Step 3: Commit**

```bash
git add app/fe/exam/[examId]/page.tsx
git commit -m "refactor(seo): /fe/exam/[examId] uses seo helpers + breadcrumbs"
```

---

## Task 25: Refactor FE question page to use helpers

**Files:**
- Modify: `app/fe/play/[examId]/q/[qNumber]/page.tsx`

- [ ] **Step 1: Replace inline JSON-LD + manual breadcrumb with helpers**

```tsx
import { makeMetadata } from "@/lib/seo/metadata"
import { questionJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

// Replace generateMetadata body:
const md = makeMetadata({
  title,
  description,
  path: canonical,
  type: "article",
})
return md
```

(Inside the existing try/catch, build `title`/`description`/`canonical` exactly as the current code does, then return `makeMetadata(...)`.)

In the render:
```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "基本情報技術者試験", href: "/fe" },
  { name: exam.title ?? exam.exam_id, href: `/fe/exam/${exam.exam_id}` },
  { name: `問${n}`, href: `/fe/play/${exam.exam_id}/q/${n}` },
]} />
<JsonLd
  data={questionJsonLd({
    name: `${exam.title ?? exam.exam_id} 午前 問${n}`,
    text: stripMd(q.body),
    url,
    choices: q.choices.map((c) => ({ label: c.label, text: c.text })),
    correctLabel: q.correct_label,
    explanation: q.explanation?.overall,
    partOfName: `${exam.title ?? exam.exam_id} 過去問`,
    partOfUrl: `https://goukaku.dev/fe/exam/${exam.exam_id}`,
  })}
/>
```

Delete the existing inline `jsonLd`/`breadcrumbJsonLd` constants and their `<script>` tags.

- [ ] **Step 2: Verify**

```
npm run typecheck && npm run test
npm run dev
```
Visit `/fe/play/<id>/q/1`. View source — JSON-LD identical structure, Breadcrumb visual present.

- [ ] **Step 3: Commit**

```bash
git add app/fe/play/[examId]/q/[qNumber]/page.tsx
git commit -m "refactor(seo): /fe/play question page uses seo helpers + breadcrumbs"
```

---

## Task 26: Refactor FE tag page to use helpers

**Files:**
- Modify: `app/fe/tag/[tag]/page.tsx`

- [ ] **Step 1: Replace inline metadata with `makeMetadata` and add Breadcrumb**

```tsx
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

// generateMetadata becomes:
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag: tagParam } = await params
  const tag = slugToTag(tagParam)
  const slug = tagToSlug(tag)
  const display = tag.replace(/^#/, "")
  return makeMetadata({
    title: `#${display} の過去問 (基本情報)`,
    description: `基本情報技術者試験の過去問のうち「${display}」タグが付いた問題の一覧。解説付き。`,
    path: `/fe/tag/${slug}`,
  })
}
```

In the rendered JSX, just below the existing `<Link href="/fe">← ホーム</Link>`:

```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "基本情報技術者試験", href: "/fe" },
  { name: `#${display}`, href: `/fe/tag/${tagToSlug(tag)}` },
]} />
```

- [ ] **Step 2: Verify**

```
npm run typecheck && npm run dev
```
Visit `/fe/tag/<some-slug>`.

- [ ] **Step 3: Commit**

```bash
git add app/fe/tag/[tag]/page.tsx
git commit -m "refactor(seo): /fe/tag uses seo helpers + breadcrumbs"
```

---

## Task 27: Refactor IP exam-detail to use helpers

**Files:**
- Modify: `app/ip/exam/[examId]/page.tsx`

Same pattern as Task 24, with `listIpExams` instead of `listExams`.

- [ ] **Step 1: Apply same refactor as Task 24**

Specifically: replace `generateMetadata` body to return `makeMetadata({...})`; replace inline `jsonLd` constant + `<script>` with `<JsonLd data={learningResourceJsonLd({...})} />`; add `<Breadcrumbs items={...} />` just above `<Link href="/ip">← ホーム</Link>`. Use `"ITパスポート試験"` for breadcrumb and `aboutName`.

Full snippet:
```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "ITパスポート試験", href: "/ip" },
  { name: examLabel, href: `/ip/exam/${exam.exam_id}` },
]} />
<JsonLd
  data={learningResourceJsonLd({
    name: `${examLabel} 過去問`,
    description: `ITパスポート試験 ${examLabel} の過去問 ${exam.question_count} 問・解説・ヒント付き`,
    url: `https://goukaku.dev/ip/exam/${exam.exam_id}`,
    numberOfItems: exam.question_count,
    aboutName: "ITパスポート試験",
  })}
/>
```

- [ ] **Step 2: Verify & commit**

```
npm run typecheck && npm run test
git add app/ip/exam/[examId]/page.tsx
git commit -m "refactor(seo): /ip/exam/[examId] uses seo helpers + breadcrumbs"
```

---

## Task 28: Refactor IP question page to use helpers

**Files:**
- Modify: `app/ip/play/[examId]/q/[qNumber]/page.tsx`

Same pattern as Task 25 but for IP. Use `listIpExams` / `listIpQuestions`. Breadcrumb says "ITパスポート試験".

- [ ] **Step 1: Apply same refactor as Task 25**

```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "ITパスポート試験", href: "/ip" },
  { name: exam.title ?? exam.exam_id, href: `/ip/exam/${exam.exam_id}` },
  { name: `問${n}`, href: `/ip/play/${exam.exam_id}/q/${n}` },
]} />
<JsonLd
  data={questionJsonLd({
    name: `${exam.title ?? exam.exam_id} 問${n}`,
    text: stripMd(q.body),
    url,
    choices: q.choices.map((c) => ({ label: c.label, text: c.text })),
    correctLabel: q.correct_label,
    explanation: q.explanation?.overall,
    partOfName: `${exam.title ?? exam.exam_id} 過去問`,
    partOfUrl: `https://goukaku.dev/ip/exam/${exam.exam_id}`,
  })}
/>
```

- [ ] **Step 2: Verify & commit**

```
npm run typecheck && npm run test
git add app/ip/play/[examId]/q/[qNumber]/page.tsx
git commit -m "refactor(seo): /ip question page uses seo helpers + breadcrumbs"
```

---

## Task 29: Add Breadcrumbs to about / privacy / terms / contact / support

**Files:**
- Modify: `app/about/page.tsx`
- Modify: `app/privacy/page.tsx`
- Modify: `app/terms/page.tsx`
- Modify: `app/contact/page.tsx`
- Modify: `app/support/page.tsx`

- [ ] **Step 1: For each page, add the import and replace `<Link href="/">← ホーム</Link>` with `<Breadcrumbs>`**

Concrete example for `app/about/page.tsx`:

Add import after the existing imports:
```tsx
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
```

Replace the existing back-link line `<Link href="/" className="inline-block text-[14px] mb-4">← ホーム</Link>` with:
```tsx
<Breadcrumbs items={[
  { name: "合格.dev", href: "/" },
  { name: "合格.dev について", href: "/about" },
]} />
```

Apply the same pattern to the other 4 files, using these breadcrumb items:

| File | Items |
|---|---|
| `app/about/page.tsx` | `[{合格.dev, /}, {合格.dev について, /about}]` |
| `app/privacy/page.tsx` | `[{合格.dev, /}, {プライバシーポリシー, /privacy}]` |
| `app/terms/page.tsx` | `[{合格.dev, /}, {利用規約, /terms}]` |
| `app/contact/page.tsx` | `[{合格.dev, /}, {お問い合わせ, /contact}]` |
| `app/support/page.tsx` | `[{合格.dev, /}, {サポート, /support}]` |

- [ ] **Step 2: Verify**

```
npm run typecheck && npm run test -- tests/app
```

Visual: visit each in dev, breadcrumb appears, no duplicate "← ホーム" link.

- [ ] **Step 3: Commit**

```bash
git add app/about/page.tsx app/privacy/page.tsx app/terms/page.tsx app/contact/page.tsx app/support/page.tsx
git commit -m "feat(seo): add Breadcrumbs to static info pages"
```

---

## Task 30: Write failing test for split sitemap

**Files:**
- Create: `tests/app/sitemap.test.ts`

Note: this exercises the new `generateSitemaps` + `sitemap(id)` signature.

- [ ] **Step 1: Write the test**

```ts
// tests/app/sitemap.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/api-client", () => ({
  listExams: vi.fn(async () => [
    { exam_id: "fe-2023h", exam: "FE", year: "2023", section: "春期", question_count: 80 },
  ]),
  listQuestions: vi.fn(async (id: string) =>
    id === "fe-2023h"
      ? [
          { _id: "q1", kind: "q", exam_id: id, q_number: 1, body: "x", choices: [], tags: ["#CPU"] },
          { _id: "q2", kind: "q", exam_id: id, q_number: 2, body: "x", choices: [], tags: ["#OS", "#CPU"] },
        ]
      : [],
  ),
  listIpExams: vi.fn(async () => [
    { exam_id: "ip-r5", exam: "IP", year: "2023", section: "通年", question_count: 100 },
  ]),
  listIpQuestions: vi.fn(async (id: string) =>
    id === "ip-r5"
      ? [
          { _id: "iq1", kind: "q", exam_id: id, q_number: 1, body: "x", choices: [] },
        ]
      : [],
  ),
}))

vi.mock("@/lib/takken/api", () => ({
  TakkenAPI: {
    listExams: vi.fn(async () => [
      { exam_id: "tk-r5", era: "令和", era_year: 5, exam_month: 10, year: 2023, label: "R5", passing_score: 36, question_count: 50 },
    ]),
    listExamQuestions: vi.fn(async (id: string) =>
      id === "tk-r5"
        ? {
            exam_id: id,
            count: 1,
            questions: [
              { _id: "tq1", question_number: 1, category: "宅建業法", format: "simple", question_text: "x", choices: { 1: "a", 2: "b", 3: "c", 4: "d" }, correct_answer: 1, accepted_answers: [1] },
            ],
          }
        : null,
    ),
  },
}))

describe("sitemap (split)", () => {
  beforeEach(() => vi.resetModules())
  afterEach(() => vi.clearAllMocks())

  it("generateSitemaps returns 5 partitions (0..4)", async () => {
    const { generateSitemaps } = await import("@/app/sitemap")
    const out = await generateSitemaps()
    expect(out).toEqual([{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])
  })

  it("partition 0 contains site root and exam landings", async () => {
    const mod = await import("@/app/sitemap")
    const urls = (await mod.default({ id: 0 })).map((e) => e.url)
    expect(urls).toContain("https://goukaku.dev/")
    expect(urls).toContain("https://goukaku.dev/fe")
    expect(urls).toContain("https://goukaku.dev/ip")
    expect(urls).toContain("https://goukaku.dev/takken")
    expect(urls).toContain("https://goukaku.dev/about")
  })

  it("partition 1 contains FE exam, question, and tag URLs", async () => {
    const mod = await import("@/app/sitemap")
    const urls = (await mod.default({ id: 1 })).map((e) => e.url)
    expect(urls).toContain("https://goukaku.dev/fe/exam/fe-2023h")
    expect(urls).toContain("https://goukaku.dev/fe/play/fe-2023h/q/1")
    expect(urls).toContain("https://goukaku.dev/fe/play/fe-2023h/q/2")
    expect(urls.some((u) => u.startsWith("https://goukaku.dev/fe/tag/"))).toBe(true)
  })

  it("partition 2 contains IP URLs", async () => {
    const mod = await import("@/app/sitemap")
    const urls = (await mod.default({ id: 2 })).map((e) => e.url)
    expect(urls).toContain("https://goukaku.dev/ip/exam/ip-r5")
    expect(urls).toContain("https://goukaku.dev/ip/play/ip-r5/q/1")
  })

  it("partition 3 contains takken URLs", async () => {
    const mod = await import("@/app/sitemap")
    const urls = (await mod.default({ id: 3 })).map((e) => e.url)
    expect(urls).toContain("https://goukaku.dev/takken")
    expect(urls).toContain("https://goukaku.dev/takken/exams/tk-r5")
    expect(urls).toContain("https://goukaku.dev/takken/exams/tk-r5/quiz?q=1")
  })

  it("partition 4 is reserved for glossary (returns array)", async () => {
    const mod = await import("@/app/sitemap")
    const list = await mod.default({ id: 4 })
    expect(Array.isArray(list)).toBe(true)
  })
})
```

- [ ] **Step 2: Run — verify it fails**

```
npx vitest run tests/app/sitemap.test.ts
```
Expected: FAIL (current `app/sitemap.ts` exports a single async function with `()` signature; no `generateSitemaps`).

---

## Task 31: Rewrite `app/sitemap.ts` with `generateSitemaps`

**Files:**
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Replace the file**

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next"
import {
  listExams,
  listQuestions,
  listIpExams,
  listIpQuestions,
} from "@/lib/api-client"
import { TakkenAPI } from "@/lib/takken/api"
import { tagToSlug } from "@/lib/tag-url"

const BASE = "https://goukaku.dev"

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  switch (id) {
    case 0:
      return rootPartition()
    case 1:
      return fePartition()
    case 2:
      return ipPartition()
    case 3:
      return takkenPartition()
    case 4:
      return glossaryPartition()
    default:
      return []
  }
}

function rootPartition(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/fe`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/ip`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/takken`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/glossary`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ]
}

async function fePartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = []
  const exams = await listExams().catch(() => [])
  const tagSet = new Set<string>()
  for (const exam of exams) {
    out.push({
      url: `${BASE}/fe/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    try {
      const questions = await listQuestions(exam.exam_id)
      for (const q of questions) {
        out.push({
          url: `${BASE}/fe/play/${exam.exam_id}/q/${q.q_number}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        })
        for (const t of q.tags ?? []) if (t) tagSet.add(t)
      }
    } catch {
      // skip
    }
  }
  for (const tag of [...tagSet].sort()) {
    out.push({
      url: `${BASE}/fe/tag/${tagToSlug(tag)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    })
  }
  return out
}

async function ipPartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = []
  const exams = await listIpExams().catch(() => [])
  for (const exam of exams) {
    out.push({
      url: `${BASE}/ip/exam/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    try {
      const questions = await listIpQuestions(exam.exam_id)
      for (const q of questions) {
        out.push({
          url: `${BASE}/ip/play/${exam.exam_id}/q/${q.q_number}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      }
    } catch {
      // skip
    }
  }
  return out
}

async function takkenPartition(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const out: MetadataRoute.Sitemap = [
    { url: `${BASE}/takken`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/takken/exams`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/takken/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ]
  const exams = await TakkenAPI.listExams().catch(() => [])
  for (const exam of exams) {
    out.push({
      url: `${BASE}/takken/exams/${exam.exam_id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
    const wrapped = await TakkenAPI.listExamQuestions(exam.exam_id)
    if (wrapped) {
      for (const q of wrapped.questions) {
        out.push({
          url: `${BASE}/takken/exams/${exam.exam_id}/quiz?q=${q.question_number}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      }
    }
  }
  for (const cat of ["権利関係", "宅建業法", "法令上の制限", "税その他"]) {
    out.push({
      url: `${BASE}/takken/categories/${encodeURIComponent(cat)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  }
  return out
}

async function glossaryPartition(): Promise<MetadataRoute.Sitemap> {
  // Phase 1: placeholder. Glossary detail pages land in Phase 3.
  // For now emit the index only — already covered in partition 0 — return [].
  return []
}
```

- [ ] **Step 2: Run sitemap tests — verify pass**

```
npx vitest run tests/app/sitemap.test.ts
```
Expected: PASS all 6 tests.

- [ ] **Step 3: Run full suite to check no regressions**

```
npm run test
```
Expected: previously-passing tests still pass.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts tests/app/sitemap.test.ts
git commit -m "feat(seo): split sitemap into 5 partitions via generateSitemaps; include takken URLs"
```

---

## Task 32: Update robots.ts disallow list

**Files:**
- Modify: `app/robots.ts`
- Modify: `tests/app/robots.test.ts`

- [ ] **Step 1: Update the test first**

Edit `tests/app/robots.test.ts` — change the existing path list:

```ts
// tests/app/robots.test.ts
import { describe, expect, it } from "vitest"
import robots from "@/app/robots"

describe("robots", () => {
  it("blocks thin local-only pages that hurt AdSense quality", () => {
    const result = robots()
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
    const disallow = Array.isArray(rule?.disallow) ? rule!.disallow : [rule?.disallow]

    for (const path of [
      "/api/",
      "/diagnosis",
      "/ip/play/random",
      "/fe/play/random",
      "/fe/bookmarks",
      "/fe/history",
      "/ip/bookmarks",
      "/ip/history",
      "/takken/bookmarks",
      "/takken/wrong",
      "/takken/stats",
      "/takken/search",
    ]) {
      expect(disallow).toContain(path)
    }
  })

  it("does NOT block the legacy /play/random alias (it 301s to /fe/play/random)", () => {
    const result = robots()
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
    const disallow = Array.isArray(rule?.disallow) ? rule!.disallow : [rule?.disallow]
    expect(disallow).not.toContain("/play/random")
  })

  it("declares the production sitemap", () => {
    const result = robots()
    expect(result.sitemap).toBe("https://goukaku.dev/sitemap.xml")
  })
})
```

- [ ] **Step 2: Run test, expect fail**

```
npx vitest run tests/app/robots.test.ts
```
Expected: FAIL on the new paths and the negative assertion.

- [ ] **Step 3: Update `app/robots.ts`**

```ts
// app/robots.ts
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/diagnosis",
          "/fe/play/random",
          "/ip/play/random",
          "/fe/bookmarks",
          "/fe/history",
          "/ip/bookmarks",
          "/ip/history",
          "/takken/bookmarks",
          "/takken/wrong",
          "/takken/stats",
          "/takken/search",
        ],
      },
    ],
    sitemap: "https://goukaku.dev/sitemap.xml",
    host: "https://goukaku.dev",
  }
}
```

- [ ] **Step 4: Run test, expect pass**

```
npx vitest run tests/app/robots.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/robots.ts tests/app/robots.test.ts
git commit -m "feat(seo): add /takken local-only paths to robots disallow; drop redundant /play/random alias"
```

---

## Task 33: Full-suite + build verification

**Files:** (none — verification only)

- [ ] **Step 1: Run typecheck**

```
npm run typecheck
```
Expected: PASS, zero errors.

- [ ] **Step 2: Run lint**

```
npm run lint
```
Expected: PASS or only pre-existing warnings.

- [ ] **Step 3: Run full test suite**

```
npm run test
```
Expected: all tests pass (existing tests untouched + new tests added in this phase).

- [ ] **Step 4: Run production build**

```
npm run build
```
Expected: build succeeds. Verify in build output:
- `○ /sitemap.xml` (or split sitemap entries) appears
- OG image routes are generated for all `opengraph-image.tsx` files (root, /fe, /ip, /takken, plus dynamic)
- No new errors or warnings

- [ ] **Step 5: Commit no changes** (verification only). If anything had to be fixed during verification, commit that fix as a separate commit.

---

## Task 34: Manual verification — Rich Results & Lighthouse

**Files:** (none — manual)

- [ ] **Step 1: Start dev server**

```
npm run dev
```

- [ ] **Step 2: Pick one representative URL per page type and run Google Rich Results Test**

URLs:
- `https://goukaku.dev/fe/exam/<some examId>` — should detect LearningResource + BreadcrumbList
- `https://goukaku.dev/fe/play/<examId>/q/1` — should detect Question + BreadcrumbList
- `https://goukaku.dev/fe/tag/<some-slug>` — should detect BreadcrumbList
- `https://goukaku.dev/takken/exams/<some examId>` — should detect LearningResource + BreadcrumbList
- `https://goukaku.dev/takken/exams/<id>/quiz?q=1` — should detect Question + BreadcrumbList
- `https://goukaku.dev/` — should detect WebSite + Organization

Use: https://search.google.com/test/rich-results

After deploying to production (post-merge), re-run these. (For pre-merge: use Vercel preview URL.)

- [ ] **Step 3: Lighthouse SEO check**

In Chrome DevTools → Lighthouse → SEO category, run against:
- `/` , `/fe`, `/ip`, `/takken`
- One question page each for FE/IP/takken
- One exam detail each

Target: SEO ≥ 95 for each.

- [ ] **Step 4: Inspect OG image of each page**

Visit each `*/opengraph-image` route directly in browser, confirm the PNG renders at 1200×630 and is legible.

- [ ] **Step 5: Document findings (no commit needed unless issues found)**

If anything fails Rich Results or scores <95, file follow-ups. Otherwise Phase 1 is complete.

---

## Final notes

- Task 21 references `current.explanation?.commentary` — this is the field name on `TakkenExplanation` (see `lib/takken/api.ts:65-74`). Do not change.
- Task 26 (FE tag refactor) intentionally does NOT add a CollectionPage JSON-LD here; that lands in Phase 2 alongside the related-tags strip.
- The Question JSON-LD shape produced by `questionJsonLd` is the same as the existing inline shape on `/fe/play/[examId]/q/[qNumber]/page.tsx:83-111`, with the addition of optional `partOfName/Url`. This guarantees no rich-results regression on the page being refactored.
- Phase 2 will add `<details>`-wrapped server-rendered explanation summary on question pages; Phase 1 deliberately keeps the rendered output the same to avoid regressions during refactor.
- The QAPage decision (spec §4.1 Phase 2 chk) is deferred to Phase 2 — Phase 1 stays with plain Question.
