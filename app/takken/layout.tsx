import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { TakkenSectionNav } from "@/components/layout/TakkenSectionNav";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "宅建士 過去問演習",
    template: "%s | 宅建 | 合格.dev",
  },
  description:
    "宅建士(宅地建物取引士)試験の過去問演習。H16〜R7の全24試験・1,200問+解説を無料で。",
};

export default function TakkenLayout({ children }: { children: React.ReactNode }) {
  // 全宅建ページ共通のフッター(セクションナビ=他資格への相互リンク含む)。
  return (
    <div className={`tk-root ${notoSans.variable}`}>
      {children}
      <footer className="mx-auto max-w-3xl px-6 pb-12 pt-2 text-xs text-ink-3">
        <div className="border-t border-line pt-6">
          <TakkenSectionNav />
          <p className="mt-5 text-center">
            過去問データは公式公開問題に基づく。解説は学習用の参考表記です。
          </p>
        </div>
      </footer>
    </div>
  );
}
