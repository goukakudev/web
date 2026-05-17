import type { ReactNode } from "react"

export interface FlowLayoutProps {
  children: ReactNode
  gapX?: number
  gapY?: number
}

export function FlowLayout({ children, gapX = 6, gapY = 6 }: FlowLayoutProps) {
  return (
    <div
      className="flex flex-wrap"
      style={{ columnGap: `${gapX}px`, rowGap: `${gapY}px` }}
    >
      {children}
    </div>
  )
}
