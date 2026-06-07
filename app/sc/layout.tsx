import type { Metadata } from "next"
import { IBM_Plex_Sans_JP, IBM_Plex_Mono } from "next/font/google"

const ibmSans = IBM_Plex_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans-jp",
  display: "swap",
})

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "情報処理安全確保支援士試験 過去問演習",
    template: "%s | SC | 合格.dev",
  },
  description:
    "情報処理安全確保支援士試験 (SC、登録セキスペ) の午前 II 公開過去問演習。順番 / ランダム / 模試 (40 分) に対応。",
}

export default function ScLayout({ children }: { children: React.ReactNode }) {
  return <div className={`sc-root ${ibmSans.variable} ${ibmMono.variable}`}>{children}</div>
}
