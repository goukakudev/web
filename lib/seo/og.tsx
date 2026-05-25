import { ImageResponse } from "next/og"
import type { ReactElement } from "react"

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = "image/png" as const

export interface RenderOgInput {
  title: string
  subtitle?: string
  badge?: string
  accent?: "pink" | "blue" | "charcoal"
}

const ACCENTS = {
  pink: { from: "#FFE4F0", to: "#FFF7FA", ink: "#1F1A1F", tag: "#D62D7B" },
  blue: { from: "#E6F2FF", to: "#F4F9FF", ink: "#0F1A2A", tag: "#0E66A8" },
  charcoal: { from: "#1E1E22", to: "#2A2A30", ink: "#FFFFFF", tag: "#FFD27A" },
} as const

export function renderOgImage(input: RenderOgInput): ImageResponse {
  const accent = ACCENTS[input.accent ?? "pink"]
  const element: ReactElement = (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: 80,
        background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
        color: accent.ink,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em" }}>
        合格.dev
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {input.badge && (
          <div
            style={{
              alignSelf: "flex-start",
              fontSize: 24, fontWeight: 700, color: accent.tag,
              padding: "8px 16px", borderRadius: 999,
              background: "rgba(255,255,255,0.65)",
            }}
          >
            {input.badge}
          </div>
        )}
        <div
          style={{
            fontSize: 72, fontWeight: 900, lineHeight: 1.15,
            letterSpacing: "-0.04em",
          }}
        >
          {input.title}
        </div>
        {input.subtitle && (
          <div
            style={{
              fontSize: 32, fontWeight: 500, opacity: 0.8, lineHeight: 1.4,
            }}
          >
            {input.subtitle}
          </div>
        )}
      </div>
    </div>
  )
  return new ImageResponse(element, OG_SIZE)
}
