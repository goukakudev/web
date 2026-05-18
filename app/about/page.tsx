import type { Metadata } from "next";
import Link from "next/link";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { listExams } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "goukaku.dev について",
  description:
    "goukaku.dev は基本情報技術者試験 (FE) の過去問を無料で、広告控えめに解ける Web サイトです。13 年分・約 840 問・解説付き。",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  let examCount = 0;
  let questionCount = 0;
  try {
    const exams = await listExams();
    examCount = exams.length;
    questionCount = exams.reduce((s, e) => s + e.question_count, 0);
  } catch {
    // fall through with zeros — page should render even if API is down
  }

  return (
    <MobileFrame>
      <Link href="/" className="inline-block text-[14px] mb-4">
        ← ホーム
      </Link>
      <h1 className="text-[24px] font-extrabold mb-4">goukaku.dev について</h1>

      <Section title="このサイトは">
        <p>
          独立行政法人情報処理推進機構 (IPA) が実施する{" "}
          <strong>基本情報技術者試験 (FE)</strong>{" "}
          の午前過去問を、ブラウザだけで無料で解けるサイトです。
        </p>
        <p className="mt-2">
          サインアップ不要。広告は最小限。学習履歴はすべてあなたのブラウザの中だけ ({" "}
          <Link href="/privacy" className="underline">
            プライバシーポリシー
          </Link>
          ) に保存されます。
        </p>
      </Section>

      <Section title="掲載量">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            試験回数: <strong>{examCount}</strong> 回分 (平成 25 年〜令和 7 年)
          </li>
          <li>
            問題数: <strong>{questionCount}</strong> 問
          </li>
          <li>全問に総評と選択肢ごとの解説付き</li>
          <li>図表は画像 (cropped) または Markdown table で正確に再現</li>
        </ul>
      </Section>

      <Section title="3 つの学習モード">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>順番に解く</strong>: Q1 から順に。問題ごとの URL も独立しているのでブックマーク・シェアが可能。
          </li>
          <li>
            <strong>ランダムに解く</strong>: 1 回毎に出題順がシャッフル。本番直前の総ざらいに。
          </li>
          <li>
            <strong>模試 (150 分)</strong>: 本試験と同じ制限時間で、最後に正答率と所要時間がレポートされます。
          </li>
        </ul>
      </Section>

      <Section title="数式と表の表示">
        <p>
          KaTeX による数式描画と Markdown table の整形表示に対応。指数・分数・行列も読みやすい形でレンダリングされます。
        </p>
      </Section>

      <Section title="出典と著作権">
        <p>
          問題文・選択肢は IPA が公開する過去問題から引用しています。解説および UI は当サイト独自の編集物です。引用に関する権利関係について疑義がある場合は{" "}
          <Link href="/contact" className="underline">
            お問い合わせ
          </Link>{" "}
          からご連絡ください。
        </p>
      </Section>

      <Section title="運営">
        <p>運営: goukaku.dev</p>
        <p className="mt-2">
          <Link href="/contact" className="underline">
            お問い合わせ
          </Link>
          {" / "}
          <Link href="/privacy" className="underline">
            プライバシーポリシー
          </Link>
        </p>
      </Section>
    </MobileFrame>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 text-[13px] leading-[1.8]">
      <h2 className="text-[16px] font-extrabold mb-2">{title}</h2>
      <div className="text-goukaku-ink/85">{children}</div>
    </section>
  );
}
