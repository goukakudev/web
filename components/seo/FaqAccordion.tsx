import type { FaqItem } from "@/lib/seo/faq/types"
import { JsonLd } from "@/components/seo/JsonLd"

export interface FaqAccordionProps {
  items: FaqItem[]
  theme?: "goukaku" | "takken"
}

export function FaqAccordion({ items, theme = "goukaku" }: FaqAccordionProps) {
  const isTakken = theme === "takken"
  const containerCls = isTakken
    ? "space-y-2.5"
    : "space-y-2"
  const detailsCls = isTakken
    ? "rounded-xl border border-line bg-bg px-4 py-3 text-[13px] leading-[1.85] text-ink-2"
    : "rounded-2xl border border-goukaku-divider bg-goukaku-surface/40 px-4 py-3 text-[13px] leading-[1.85] text-goukaku-ink/85"
  const summaryCls = isTakken
    ? "cursor-pointer font-mincho font-semibold text-ink text-[14px]"
    : "cursor-pointer font-extrabold text-goukaku-ink/85 text-[14px]"
  const answerCls = isTakken
    ? "mt-3 text-ink-2"
    : "mt-3 text-goukaku-ink/80"

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((it) => ({
            "@type": "Question",
            name: it.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: it.answer,
            },
          })),
        }}
      />
      <ul className={containerCls}>
        {items.map((it, i) => (
          <li key={i}>
            <details className={detailsCls}>
              <summary className={summaryCls}>{it.question}</summary>
              <p className={answerCls}>{it.answer}</p>
            </details>
          </li>
        ))}
      </ul>
    </>
  )
}
