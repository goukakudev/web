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

// satori (next/og) only accepts OTF/TTF — it rejects woff2 with
// "Unsupported OpenType signature wOF2". Google Fonts returns woff2 to
// modern UAs, so we use the old-UA + text=... API to get an opentype/
// truetype subset containing only the glyphs we actually render.
const LEGACY_UA =
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.116 Safari/537.36"

async function loadFontSubset(
  text: string,
  weight: 400 | 700 | 900,
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&text=${encodeURIComponent(text)}&display=swap`
  const css = await fetch(url, { headers: { "User-Agent": LEGACY_UA } }).then(
    (r) => r.text(),
  )
  const match = css.match(/src:\s*url\((.+?)\)\s*format\('(opentype|truetype|woff)'\)/)
  if (!match) {
    throw new Error(`OG font: could not extract opentype/truetype/woff URL for weight ${weight} (css: ${css.slice(0, 200)})`)
  }
  const fontRes = await fetch(match[1])
  if (!fontRes.ok) {
    throw new Error(`OG font: fetch failed for ${match[1]}`)
  }
  return fontRes.arrayBuffer()
}

export async function renderOgImage(input: RenderOgInput): Promise<ImageResponse> {
  const accent = ACCENTS[input.accent ?? "pink"]
  const allText = ["合格.dev", input.title, input.subtitle ?? "", input.badge ?? ""].join(
    " ",
  )
  const [regular, bold, black] = await Promise.all([
    loadFontSubset(allText, 400),
    loadFontSubset(allText, 700),
    loadFontSubset(allText, 900),
  ])
  const fonts = [
    { name: "Noto Sans JP", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Noto Sans JP", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Noto Sans JP", data: black, weight: 900 as const, style: "normal" as const },
  ]

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
  return new ImageResponse(element, { ...OG_SIZE, fonts })
}
