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

// Cache fetched fonts across invocations within a single process
let fontsPromise: Promise<
  { name: string; data: ArrayBuffer; weight: 400 | 700 | 900; style: "normal" }[]
> | null = null

// Fetched via Firefox 40 UA from Google Fonts (v56, full Japanese coverage, ~2 MB each).
// Single woff2 per weight — no unicode-range subsetting — so all CJK glyphs are available.
// To refresh: fetch https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap
// with UA "Mozilla/5.0 (Windows NT 6.0; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1"
// and copy the three src: url(...) values.
const FONT_SOURCES = [
  {
    weight: 400 as const,
    url: "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj754.woff2",
  },
  {
    weight: 700 as const,
    url: "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFPYk754.woff2",
  },
  {
    weight: 900 as const,
    url: "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFLgk754.woff2",
  },
] as const

async function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      FONT_SOURCES.map(async (src) => {
        const res = await fetch(src.url)
        if (!res.ok) throw new Error(`Failed to fetch OG font (${src.weight}): ${src.url}`)
        const data = await res.arrayBuffer()
        return { name: "Noto Sans JP", data, weight: src.weight, style: "normal" as const }
      }),
    )
  }
  return fontsPromise
}

export async function renderOgImage(input: RenderOgInput): Promise<ImageResponse> {
  const accent = ACCENTS[input.accent ?? "pink"]
  const element: ReactElement = (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: 80,
        background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
        color: accent.ink,
        fontFamily: "Noto Sans JP",
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
  const fonts = await loadFonts()
  return new ImageResponse(element, { ...OG_SIZE, fonts })
}
