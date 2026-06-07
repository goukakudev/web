import Link from "next/link"

export function ScSectionHead({
  title,
  trailingHref,
  trailingLabel,
}: {
  title: string
  trailingHref?: string
  trailingLabel?: string
}) {
  return (
    <div className="sc-section-head">
      <div className="sc-section-head-left">
        <span className="sc-section-head-bar" aria-hidden />
        <span className="sc-section-head-title">{title}</span>
      </div>
      {trailingHref && trailingLabel && (
        <Link href={trailingHref} className="sc-section-head-trailing">
          {trailingLabel} →
        </Link>
      )}
    </div>
  )
}

export function ScHairline({ strong = false }: { strong?: boolean }) {
  return <span className={strong ? "sc-hairline-strong" : "sc-hairline"} role="presentation" />
}

export function ScTopBar({
  title,
  leading,
  trailing,
}: {
  title: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <header className="sc-topbar">
      <div>{leading}</div>
      <div className="sc-topbar-title">{title}</div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>{trailing}</div>
    </header>
  )
}

export function ScDonut({
  pct,
  size = 118,
  stroke = 13,
  caption = "総合正解率",
}: {
  pct: number
  size?: number
  stroke?: number
  caption?: string
}) {
  const safePct = Math.max(0, Math.min(100, pct))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (safePct / 100) * c
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${caption} ${safePct}%`}
    >
      <defs>
        <linearGradient id="sc-donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-sc-primary)" />
          <stop offset="100%" stopColor="var(--color-sc-primary-deep)" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-sc-track)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#sc-donut-grad)"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="48%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-sc-mono)"
        fontSize={size * 0.23}
        fontWeight={700}
        fill="var(--color-sc-ink)"
      >
        {safePct}
        <tspan fontSize={size * 0.11} fontWeight={600} dx="1">
          %
        </tspan>
      </text>
      <text
        x="50%"
        y="68%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-sc-sans)"
        fontSize={size * 0.08}
        fontWeight={700}
        letterSpacing="1"
        fill="var(--color-sc-t3)"
      >
        {caption}
      </text>
    </svg>
  )
}
