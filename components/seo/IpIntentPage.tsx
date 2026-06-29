import Link from "next/link"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { JsonLd } from "@/components/seo/JsonLd"
import { SITE_URL, webPageJsonLd } from "@/lib/seo/structured-data"

export interface IpIntentSection {
  heading: string
  body: string
  links?: { href: string; label: string }[]
}

export function IpIntentPage({
  title,
  description,
  path,
  lead,
  sections,
  primaryHref = "/ip/play/random?count=20",
  primaryLabel = "20問だけ演習する",
}: {
  title: string
  description: string
  path: string
  lead: string
  sections: IpIntentSection[]
  primaryHref?: string
  primaryLabel?: string
}) {
  return (
    <>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "ITパスポート試験", href: "/ip" },
        { name: title.replace(" | 合格.dev", ""), href: path },
      ]} />
      <JsonLd
        data={webPageJsonLd({
          name: title,
          description,
          url: `${SITE_URL}${path}`,
        })}
      />

      <article className="text-[13px] leading-[1.85] text-goukaku-ink/85">
        <p className="text-[11px] font-bold tracking-[1.2px] text-goukaku-ink/50 uppercase">
          IT Passport
        </p>
        <h1 className="mt-1 text-[22px] font-extrabold leading-[1.45] text-goukaku-ink">
          {title.replace(" | 合格.dev", "")}
        </h1>
        <p className="mt-3 text-goukaku-ink/72">{lead}</p>

        <div className="mt-5 grid grid-cols-1 gap-2">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-lg bg-goukaku-ink-fixed px-4 py-3 text-[13px] font-extrabold text-goukaku-lime"
            data-analytics-event="start_practice_click"
            data-analytics-props={JSON.stringify({ subject: "ip", source: path })}
          >
            {primaryLabel}
          </Link>
          <Link
            href="/pro"
            className="inline-flex items-center justify-center rounded-lg border border-goukaku-divider bg-goukaku-surface px-4 py-3 text-[13px] font-extrabold text-goukaku-ink/80"
            data-analytics-event="pro_cta_click"
            data-analytics-props={JSON.stringify({ subject: "ip", source: path })}
          >
            弱点分析・復習機能を見る
          </Link>
        </div>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-[17px] font-extrabold text-goukaku-ink">
                {section.heading}
              </h2>
              <p className="mt-2 whitespace-pre-line text-goukaku-ink/78">
                {section.body}
              </p>
              {section.links && section.links.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex rounded-full border border-goukaku-divider bg-goukaku-surface/45 px-3 py-1.5 text-[12px] font-bold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-xl border border-goukaku-divider bg-goukaku-surface/45 p-4">
          <h2 className="text-[15px] font-extrabold text-goukaku-ink">
            公式情報の確認
          </h2>
          <p className="mt-2 text-[12px] text-goukaku-ink/68">
            試験制度・申込・実施状況は変更されることがあります。最新の制度情報は IPA と iパス公式サイトを確認してください。合格.dev は公式サイトではなく、過去問演習と独自解説を提供する学習サイトです。
          </p>
          <ul className="mt-3 space-y-1 text-[12px]">
            <li>
              <a href="https://www.ipa.go.jp/shiken/kubun/ip.html" target="_blank" rel="noopener noreferrer" className="underline">
                IPA: ITパスポート試験
              </a>
            </li>
            <li>
              <a href="https://www3.jitec.ipa.go.jp/JitesCbt/html/about/range.html" target="_blank" rel="noopener noreferrer" className="underline">
                iパス公式: 試験内容・出題範囲
              </a>
            </li>
          </ul>
        </section>
      </article>
    </>
  )
}
