// 看護 (Kango) 共通UI — iOS Components.swift を移植。純表示 (props のみ) で server/client 両用。
import type { ReactNode } from "react"

/** ブランドロゴ — 角丸グラデ + 白ハート + 青プラス。 */
export function KangoLogo({ size = 34 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: "linear-gradient(135deg,#38b6ff,#2f6bf6)",
        boxShadow: "0 4px 6px rgba(47,107,246,.35)",
        display: "grid",
        placeItems: "center",
        flex: "none",
      }}
    >
      <svg width={size * 0.64} height={size * 0.64} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 20.5S3.5 15.5 3.5 9.6C3.5 6.9 5.6 5 8 5c1.7 0 3.1 1 4 2.4C12.9 6 14.3 5 16 5c2.4 0 4.5 1.9 4.5 4.6 0 5.9-8.5 10.9-8.5 10.9z"
          fill="#fff"
        />
        <path d="M12 9v4.2M9.9 11.1h4.2" stroke="#2f6bf6" strokeWidth="2.1" strokeLinecap="round" />
      </svg>
    </div>
  )
}

/** チップ (淡青ピル)。 */
export function Chip({
  children,
  icon,
  tone = "blue",
}: {
  children: ReactNode
  icon?: ReactNode
  tone?: "blue" | "green" | "plain"
}) {
  const tones: Record<string, { bg: string; fg: string }> = {
    blue: { bg: "var(--color-kn-tint)", fg: "var(--color-kn-primary-text)" },
    green: { bg: "var(--color-kn-success-soft)", fg: "var(--color-kn-success)" },
    plain: { bg: "var(--color-kn-surface-2)", fg: "var(--color-kn-text-1)" },
  }
  const t = tones[tone]
  return (
    <span className="kn-chip" style={{ background: t.bg, color: t.fg }}>
      {icon}
      {children}
    </span>
  )
}

/** 進捗バー。value は 0..1。 */
export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className="kn-pbar">
      <i style={{ width: `${pct}%` }} />
    </div>
  )
}

/** 正解率ドーナツ。value は 0..100。 */
export function Donut({
  value,
  size = 132,
  stroke = 13,
  label = "正解率",
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
}) {
  const v = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c * (1 - v / 100)
  const gid = `kn-donut-${size}`
  return (
    <div style={{ width: size, height: size, position: "relative", flex: "none" }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-kn-surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a78ff" />
            <stop offset="1" stopColor="#1f5fef" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-kn-text-2)" }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-kn-text-1)", lineHeight: 1.1 }}>
            {v}
            <span style={{ fontSize: 16, fontWeight: 700 }}>%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 小見出し (eyebrow)。 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-kn-primary-text)", margin: 0 }}>{children}</p>
}

/** カード (白面 + 影)。 */
export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`kn-card ${className}`} style={{ padding: 16, ...style }}>
      {children}
    </div>
  )
}
