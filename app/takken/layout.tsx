import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "宅建士 過去問演習",
    template: "%s | 宅建 | goukaku.dev",
  },
  description:
    "宅建士(宅地建物取引士)試験の過去問演習。H16〜R7の全24試験・1,200問+解説を無料で。",
};

export default function TakkenLayout({ children }: { children: React.ReactNode }) {
  return <div className={`tk-root ${notoSans.variable}`}>{children}</div>;
}
