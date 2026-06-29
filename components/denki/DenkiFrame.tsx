import type { ReactNode } from "react"
import Link from "next/link"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { DenkiTopNavClient } from "@/components/denki/DenkiTopNavClient"

export function DenkiTopNav({ showMenu = true }: { showMenu?: boolean }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#d8d1bc] pb-4">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-[14px] font-black">
        <span className="grid size-9 place-items-center rounded-lg border-2 border-[#191815] bg-[#ffe25a] shadow-[3px_3px_0_#191815]">
          ⚡
        </span>
        <span>goukaku.dev</span>
      </Link>
      {showMenu ? <DenkiTopNavClient /> : null}
    </header>
  )
}

export function DenkiFrame({
  children,
  title,
  eyebrow,
  description,
  wide = false,
  backHref = "/denki",
  backLabel = "第二種電気工事士トップ",
}: {
  children: ReactNode
  title?: string
  eyebrow?: string
  description?: string
  wide?: boolean
  backHref?: string
  backLabel?: string
}) {
  return (
    <main className="min-h-screen bg-[#f5f2e8] text-[#191815]">
      <div
        className={[
          "mx-auto flex min-h-screen w-full flex-col px-4 py-5 sm:px-6 lg:px-8",
          wide ? "max-w-6xl" : "max-w-3xl",
        ].join(" ")}
      >
        <DenkiTopNav />
        {title ? (
          <section className="my-6 rounded-lg border-2 border-[#191815] bg-[#fffdf6] p-5 shadow-[5px_5px_0_#191815] sm:p-6">
            {eyebrow ? (
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#007c83]">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-2 text-[26px] font-black leading-tight tracking-normal sm:text-[34px]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 text-[13px] font-medium leading-relaxed text-[#4d473a] sm:text-[14px]">
                {description}
              </p>
            ) : null}
            {backHref ? (
              <Link
                href={backHref}
                className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-[#191815]/20 bg-[#f5f2e8] px-3 py-2 text-[12px] font-extrabold transition hover:border-[#191815]"
              >
                ← {backLabel}
              </Link>
            ) : null}
          </section>
        ) : null}
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
    </main>
  )
}

export function DenkiStudyFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f5f2e8] text-[#191815]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-5 sm:px-6">
        <DenkiTopNav showMenu={false} />
        <div className="flex-1 py-5">{children}</div>
        <SiteFooter />
      </div>
    </main>
  )
}
