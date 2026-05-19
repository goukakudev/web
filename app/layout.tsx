import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { PendingFlusher } from "@/components/common/PendingFlusher"
import { CookieConsent } from "@/components/common/CookieConsent"

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-0806107180807915"

const SITE_NAME = "goukaku.dev"
const SITE_URL = "https://goukaku.dev"
const DEFAULT_TITLE = "goukaku.dev — 基本情報技術者試験 過去問 + 解説"
const DEFAULT_DESCRIPTION =
  "基本情報技術者試験の過去問を無料で。13 年分・各 80 問前後を、順番に / ランダムに / 模試形式で解けます。全問解説・選択肢ごとの解説付き。"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | goukaku.dev",
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
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "ゴウカクドットデブ",
  url: SITE_URL,
  inLanguage: "ja",
  description: DEFAULT_DESCRIPTION,
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
}

const themeInitScript = `(function(){try{var p=localStorage.getItem('goukaku.theme')||'auto';var d=p==='dark'||(p==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {ADSENSE_CLIENT && (
          <Script
            id="adsense-init"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <PendingFlusher />
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
