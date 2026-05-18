import type { Metadata } from "next";
import Link from "next/link";
import { MobileFrame } from "@/components/layout/MobileFrame";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "goukaku.dev のプライバシーポリシー。Google AdSense のクッキー利用、localStorage に保存する情報、第三者サービス (Cloudflare R2 / Vercel) について明記します。",
  alternates: { canonical: "/privacy" },
};

const REVISED = "2026-05-18";

export default function PrivacyPage() {
  return (
    <MobileFrame>
      <Link href="/" className="inline-block text-[14px] mb-4">
        ← ホーム
      </Link>
      <h1 className="text-[24px] font-extrabold mb-2">プライバシーポリシー</h1>
      <p className="text-[12px] text-goukaku-ink/55 mb-6">最終更新日: {REVISED}</p>

      <Section title="1. このページの目的">
        <p>
          本ポリシーは、goukaku.dev (以下「当サイト」) を利用するにあたって、訪問者の情報をどのように取り扱うかを明記するものです。
        </p>
      </Section>

      <Section title="2. 当サイトが取得しない情報">
        <ul className="list-disc pl-5 space-y-1">
          <li>氏名、住所、電話番号などの個人情報は一切取得しません。</li>
          <li>会員登録・サインアップ機能はありません。</li>
          <li>パスワードや認証情報の保存はありません。</li>
        </ul>
      </Section>

      <Section title="3. ブラウザの localStorage に保存する情報">
        <p>
          学習体験の継続性のため、訪問者のブラウザの localStorage に以下の情報を保存します。これらの情報は当サイトのサーバーに送信される場合がありますが、いずれの場合でも個人を特定する情報を含みません。
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <code>device_id</code>: ブラウザ初回アクセス時にランダム生成される識別子 (UUID)。学習履歴を端末単位で集計するためのみに使用します。
          </li>
          <li>
            <code>examquiz.answers.v1</code>: 解答した問題 ID と選択肢、正誤、解答時刻。
          </li>
          <li>
            <code>examquiz.sessions.v1</code>: 模試モードで終了したセッションの結果 (正解数 / 経過時間)。
          </li>
        </ul>
        <p className="mt-2">
          これらはすべてブラウザの「サイトデータを削除」操作でクリアできます。
        </p>
      </Section>

      <Section title="4. Cookie について">
        <p>
          当サイト自体はトラッキング目的の Cookie を発行していません。ただし、後述する Google AdSense などの第三者配信サービスにより Cookie が利用される場合があります。
        </p>
      </Section>

      <Section title="5. 第三者配信の広告サービスについて">
        <p>
          当サイトは Google AdSense などの第三者配信事業者の広告を掲載することがあります (掲載開始後)。これらの広告配信事業者は、訪問者の興味に応じた広告を表示するため、Cookie などを使用してアクセス情報を収集することがあります。
        </p>
        <p className="mt-2">
          Google による Cookie の使用を無効にする方法、第三者配信事業者の Cookie ポリシーについては以下をご確認ください。
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              ポリシーと規約 - Google (広告)
            </a>
          </li>
          <li>
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              広告のカスタマイズ (Google アカウント設定)
            </a>
          </li>
        </ul>
      </Section>

      <Section title="6. 利用している第三者サービス">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Vercel</strong> — Web サイトのホスティング、CDN、サーバーレス関数の実行。アクセスログ (IP アドレス、User-Agent 等) が運営目的で保持されます。
          </li>
          <li>
            <strong>Cloudflare R2 / CDN</strong> — 図表画像の配信。エッジでのキャッシュ統計やアクセスログが処理されます。
          </li>
          <li>
            <strong>Google AdSense</strong> — 広告配信 (将来掲載予定)。
          </li>
        </ul>
      </Section>

      <Section title="7. アクセス解析">
        <p>
          現時点で Google Analytics や同等のアクセス解析ツールは導入していません。将来導入する場合は本ポリシーを更新します。
        </p>
      </Section>

      <Section title="8. 免責事項">
        <p>
          当サイトに掲載する問題および解説は、独立行政法人情報処理推進機構 (IPA) の過去問を元に独自に編集したものです。内容の正確性には最善を尽くしていますが、誤りや古い情報が含まれる可能性があります。本サイトの利用により生じたいかなる損害についても、運営者は責任を負いません。
        </p>
      </Section>

      <Section title="9. お問い合わせ">
        <p>
          本ポリシーに関するお問い合わせは、{" "}
          <Link href="/contact" className="underline">
            お問い合わせページ
          </Link>{" "}
          からお願いします。
        </p>
      </Section>

      <Section title="10. 改訂履歴">
        <ul className="list-disc pl-5 space-y-1">
          <li>{REVISED}: 初版公開</li>
        </ul>
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
