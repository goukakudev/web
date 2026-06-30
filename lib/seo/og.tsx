import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import path from "node:path"
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

// Fonts are bundled locally (lib/seo/fonts) so OG generation needs NO network
// at build OR run time — previously we fetched a subset from fonts.gstatic.com,
// which breaks in network-restricted build environments (e.g. the container
// build). satori (next/og) accepts TTF/OTF but rejects woff2. We ship the Noto
// Sans JP "japanese" subset (JP glyphs) + "latin" subset (ASCII like "合格.dev")
// for each weight; satori falls back glyph-by-glyph across the list.
// These files are pulled into the standalone build via next.config
// outputFileTracingIncludes.
const FONT_DIR = path.join(process.cwd(), "lib/seo/fonts")

async function loadFont(file: string): Promise<ArrayBuffer> {
  const buf = await readFile(path.join(FONT_DIR, file))
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer
}

type OgFont = {
  name: string
  data: ArrayBuffer
  weight: 400 | 700 | 900
  style: "normal"
}

// Load + cache once per server process (OG images are generated repeatedly).
let fontsPromise: Promise<OgFont[]> | null = null
function loadFonts(): Promise<OgFont[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      loadFont("notosansjp-400.ttf"),
      loadFont("notosansjp-700.ttf"),
      loadFont("notosansjp-900.ttf"),
      loadFont("notosansjp-latin-400.ttf"),
      loadFont("notosansjp-latin-700.ttf"),
      loadFont("notosansjp-latin-900.ttf"),
    ]).then(([jp4, jp7, jp9, la4, la7, la9]) => [
      { name: "Noto Sans JP", data: jp4, weight: 400, style: "normal" },
      { name: "Noto Sans JP", data: jp7, weight: 700, style: "normal" },
      { name: "Noto Sans JP", data: jp9, weight: 900, style: "normal" },
      { name: "Noto Sans JP", data: la4, weight: 400, style: "normal" },
      { name: "Noto Sans JP", data: la7, weight: 700, style: "normal" },
      { name: "Noto Sans JP", data: la9, weight: 900, style: "normal" },
    ])
  }
  return fontsPromise
}

export async function renderOgImage(input: RenderOgInput): Promise<ImageResponse> {
  const accent = ACCENTS[input.accent ?? "pink"]
  const fonts = await loadFonts()

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
