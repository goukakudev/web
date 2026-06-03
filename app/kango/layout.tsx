import type { Metadata } from "next"
import { Noto_Sans_JP } from "next/font/google"

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "看護師国家試験 過去問演習",
    template: "%s | 看護 | 合格.dev",
  },
  description:
    "看護師・保健師・助産師 国家試験の過去問演習。第115回ほか全問・選択肢別解説付きを無料で。",
}

export default function KangoLayout({ children }: { children: React.ReactNode }) {
  // .kn-root が淡青グラデ背景・フォント・配色を提供する (globals.css)。
  return <div className={`kn-root ${notoSans.variable}`}>{children}</div>
}
