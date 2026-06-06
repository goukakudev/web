import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { PendingFlusher } from "@/components/common/PendingFlusher"
import { CookieConsent } from "@/components/common/CookieConsent"
import { SITE_NAME, SITE_URL, websiteJsonLd, organizationJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"

const DEFAULT_TITLE = "合格.dev — 資格試験の過去問学習サイト"
const DEFAULT_DESCRIPTION =
  "基本情報技術者試験・宅地建物取引士など、各種資格の過去問を無料で。解説・選択肢別解説・模試モード付き。"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | 合格.dev",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "google-adsense-account": "ca-pub-0806107180807915",
  },
}

const themeInitScript = `(function(){try{var p=localStorage.getItem('goukaku.theme')||'auto';var d=p==='dark'||(p==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={organizationJsonLd()} />
        <PendingFlusher />
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  )
}
