import Link from "next/link"

export function ScTodayCTA({
  href,
  title,
  subtitle,
}: {
  href: string
  title: string
  subtitle: string
}) {
  return (
    <Link href={href} className="sc-today-cta" data-testid="sc-today-cta">
      <span className="sc-today-cta-icon" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5" />
          <path d="M21 3l-7 7" />
          <path d="M8 21H3v-5" />
          <path d="M3 21l7-7" />
          <path d="M16 21h5v-5" />
          <path d="M21 21l-7-7" />
          <path d="M8 3H3v5" />
          <path d="M3 3l7 7" />
        </svg>
      </span>
      <span className="sc-today-cta-text">
        <span className="sc-today-cta-title">{title}</span>
        <span className="sc-today-cta-sub">{subtitle}</span>
      </span>
      <span className="sc-today-cta-arrow" aria-hidden>
        →
      </span>
    </Link>
  )
}
