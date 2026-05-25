import Link from "next/link";
import type { Metadata } from "next";
import { MobileFrame } from "@/components/layout/MobileFrame";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  description:
    "お探しのページは見つかりませんでした。URL が変更されたか、削除された可能性があります。",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <MobileFrame>
      <div className="flex flex-col items-center text-center pt-10 pb-6">
        <div
          className="text-[80px] leading-none text-goukaku-pink-script"
          style={{ fontFamily: "var(--font-script)" }}
        >
          404
        </div>
        <div className="mt-3 text-[20px] font-extrabold tracking-tight">
          ページが見つかりません
        </div>
        <p className="mt-3 text-[13px] text-goukaku-ink/55 leading-relaxed max-w-[280px]">
          お探しのページは見つかりませんでした。
          <br />
          URL が変更されたか、削除された可能性があります。
        </p>
      </div>

      <div className="flex flex-col gap-2.5 mt-2">
        <Link
          href="/"
          className="block text-center py-3.5 rounded-full font-extrabold text-[14px] tracking-widest bg-goukaku-ink-fixed text-goukaku-lime"
        >
          ホームに戻る
        </Link>
        <Link
          href="/fe/play/random?count=20"
          className="block text-center py-3.5 rounded-full font-extrabold text-[13px] tracking-wider bg-goukaku-surface border border-goukaku-divider"
        >
          ランダム 20 問に挑戦 →
        </Link>
      </div>

      <div className="mt-8 px-4 py-3.5 rounded-2xl bg-goukaku-warm border border-goukaku-divider">
        <div className="text-[11px] font-extrabold tracking-widest text-goukaku-ink/55 mb-1.5">
          困ったときは
        </div>
        <p className="text-[12px] text-goukaku-ink/75 leading-relaxed">
          ハッシュタグや過去問へのリンクが古い形式の可能性があります。
          ホームから探し直すか、
          <Link href="/support" className="underline font-bold">
            サポート
          </Link>
          までご連絡ください。
        </p>
      </div>
    </MobileFrame>
  );
}
