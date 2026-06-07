import Link from "next/link"
import type { ReactNode } from "react"
import { ScTopBar } from "./ScChrome"
import { ScThemeToggle } from "./ScThemeToggle"

/** /sc/* サブページ共通の iOS 風フレーム。
 *  TopBar (戻る + タイトル) + 本文 + テーマ切替 (AUTO/LIGHT/DARK)。
 *  MobileFrame は使わず、SiteFooter も自前で出さない (層が違うので親 layout が出す)。 */
export function ScPageFrame({
  title,
  backHref = "/sc",
  trailing,
  children,
}: {
  title: string
  backHref?: string
  trailing?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="sc-page">
      <ScTopBar
        title={title}
        leading={
          <Link href={backHref} className="sc-icon-btn" aria-label="戻る">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        }
        trailing={trailing}
      />
      <div className="sc-page-body">{children}</div>
      <ScThemeToggle />
    </main>
  )
}
