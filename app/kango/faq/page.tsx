import type { Metadata } from "next"
import Link from "next/link"
import { makeMetadata } from "@/lib/seo/metadata"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { KangoNav, KangoBreadcrumb } from "@/components/kango/KangoNav"
import { KANGO_FAQ } from "@/lib/kango/faq"

export const metadata: Metadata = makeMetadata({
  title: "看護師国家試験 FAQ",
  description:
    "看護師国家試験に関するよくある質問。合格基準(必修問題の8割)・試験日(2月)・出題形式・保健師/助産師との関係・採点除外/複数正解の扱い・利用料などをまとめています。",
  path: "/kango/faq",
})

export default function KangoFaqPage() {
  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 48px" }}>
        <KangoBreadcrumb
          items={[
            { name: "合格.dev", href: "/" },
            { name: "看護", href: "/kango" },
            { name: "FAQ", href: "/kango/faq" },
          ]}
        />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "合格.dev", url: `${SITE_URL}/` },
            { name: "看護師国家試験 過去問", url: `${SITE_URL}/kango` },
            { name: "FAQ", url: `${SITE_URL}/kango/faq` },
          ])}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: KANGO_FAQ.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }}
        />

        <header style={{ marginBottom: 18 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-kn-text-1)", margin: 0 }}>看護師国家試験 FAQ</h1>
          <p style={{ fontSize: 12.5, color: "var(--color-kn-text-3)", margin: "6px 0 0" }}>よくある質問</p>
        </header>
        <p style={{ fontSize: 13.5, lineHeight: 1.85, color: "var(--color-kn-text-2)", marginBottom: 18 }}>
          看護師国家試験について、合格基準・試験形式・保健師/助産師との関係・採点の扱いなど、よく聞かれる質問を {KANGO_FAQ.length} 項目にまとめました。
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {KANGO_FAQ.map((f, i) => (
            <details key={i} className="kn-card" style={{ padding: "14px 16px" }}>
              <summary style={{ cursor: "pointer", fontWeight: 800, fontSize: 14.5, color: "var(--color-kn-text-1)" }}>{f.question}</summary>
              <p style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.85, color: "var(--color-kn-text-2)" }}>{f.answer}</p>
            </details>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "var(--color-kn-text-3)", marginTop: 24 }}>
          ←{" "}
          <Link href="/kango" style={{ textDecoration: "underline", color: "var(--color-kn-primary-text)" }}>
            看護のトップ
          </Link>
        </p>
        <footer style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--color-kn-line)" }}>
          <KangoNav current="/kango/faq" />
        </footer>
      </div>
    </main>
  )
}
