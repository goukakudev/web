import type { ReactNode } from "react"
import { SiteFooter } from "./SiteFooter"

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[440px] px-5 py-4 min-h-screen">
      {children}
      <SiteFooter />
    </div>
  )
}
