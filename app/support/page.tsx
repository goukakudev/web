import type { Metadata } from "next";
import Link from "next/link";
import { MobileFrame } from "@/components/layout/MobileFrame";

const CONTACT_EMAIL = "contact@goukaku.dev";

export const metadata: Metadata = {
  title: "サポート",
  description:
    "合格.dev (Web / iOS アプリ) のサポートページ。よくある質問と問い合わせ先をまとめています。",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  const mailto = (subject: string) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <MobileFrame>
      <Link href="/" className="inline-block text-[14px] mb-4">
        ← ホーム
      </Link>
      <h1 className="text-[24px] font-extrabold mb-2">サポート</h1>
      <p className="text-[13px] text-goukaku-ink/70 mb-6 leading-[1.7]">
        基本情報技術者試験 (FE) の過去問演習サービス <strong>合格.dev</strong>{" "}
        (Web / iOS アプリ) のサポートページです。よくある質問と問い合わせ先をまとめています。
      </p>

      <Section title="お問い合わせ先">
        <p>
          ご質問・不具合報告・ご要望は以下のメールアドレスまでお寄せください。{" "}
          通常 1〜3 営業日以内の返信を心がけていますが、確約はできません。
        </p>
        <p className="mt-3">
          <a
            href={mailto("サポート - 合格.dev")}
            className="underline font-extrabold"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="mt-3 text-[12px] text-goukaku-ink/60">
          Web サイトの{" "}
          <Link href="/contact" className="underline">
            お問い合わせフォーム
          </Link>{" "}
          からもご連絡いただけます。
        </p>
      </Section>

      <Section title="よくある質問 (iOS アプリ)">
        <Faq q="アプリは無料ですか?">
          はい、完全無料でご利用いただけます。アプリ内課金もありません。広告は将来掲載する可能性がありますが、現時点では表示していません。
        </Faq>
        <Faq q="どの試験に対応していますか?">
          現在は<strong>基本情報技術者試験 (FE) 科目 A</strong>{" "}
          の過去問に対応しています。令和7年度春期 から 平成25年度春期 まで、13 期分・約 800 問以上を収録しています。
        </Faq>
        <Faq q="アカウント登録は必要ですか?">
          不要です。アプリを起動するだけですぐに学習を始められます。学習履歴は端末内にのみ保存されます。
        </Faq>
        <Faq q="学習履歴をリセットしたいです">
          ホーム画面下部の「設定」セクションにある<strong>「試験データをリセット」</strong>{" "}
          ボタンを使用してください。解答履歴・模試結果・オフラインキャッシュをすべて削除します。問題データ自体は再取得されます。
        </Faq>
        <Faq q="模試モード(90 分タイマー)とは?">
          本番形式を模した出題モードです。ランダムに出題された問題に 90 分以内で解答し、終了時に自動採点されます。途中で時間が切れた場合も強制的に採点画面に遷移します。
        </Faq>
        <Faq q="模試モード中に Good / Bad / 問題報告ボタンが表示されません">
          本番に集中していただくため、模試モード中はフィードバックボタンを意図的に非表示にしています。通常の演習モードでは表示されます。
        </Faq>
        <Faq q="問題の誤りを見つけました">
          各問題画面下部の<strong>「問題を報告」</strong>{" "}
          ボタンからご報告ください。または{" "}
          <a href={mailto("問題報告 - 合格.dev")} className="underline">
            {CONTACT_EMAIL}
          </a>{" "}
          まで直接ご連絡いただいても構いません。問題 ID(画面上部のヘッダー)を添えていただけると確認がスムーズです。
        </Faq>
        <Faq q="オフラインで使えますか?">
          一度開いた試験データは端末にキャッシュされ、機内モードでも再演習できます。新しい試験データの取得時にはインターネット接続が必要です。
        </Faq>
        <Faq q="ダークモードに切り替えたい">
          ホーム画面下部の「設定」 セクションの<strong>テーマ</strong>{" "}
          (自動 / ライト / ダーク) から切り替えられます。「自動」は iOS のシステム設定に追従します。
        </Faq>
        <Faq q="iPad で使えますか?">
          はい、iPad にも完全対応しています。大画面でも快適に学習できるよう最適化しています。
        </Faq>
        <Faq q="動作環境は?">
          iOS 17 以降を推奨しています。
        </Faq>
        <Faq q="個人情報は収集されますか?">
          氏名・住所・メールアドレス等の個人情報は一切収集しません。詳細は{" "}
          <Link href="/privacy" className="underline">
            プライバシーポリシー
          </Link>{" "}
          をご覧ください。
        </Faq>
      </Section>

      <Section title="不具合報告のコツ">
        <p>不具合報告の際は以下の情報を含めていただけると、早く解決できます。</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>端末モデル (例: iPhone 15 Pro, iPad Pro 13")</li>
          <li>iOS バージョン (設定 → 一般 → 情報)</li>
          <li>アプリのバージョン</li>
          <li>再現手順</li>
          <li>該当する問題 ID (問題画面のヘッダーに表示)</li>
          <li>スクリーンショット (あれば)</li>
        </ul>
      </Section>

      <Section title="関連リンク">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <Link href="/about" className="underline">
              合格.dev について
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="underline">
              プライバシーポリシー
            </Link>
          </li>
          <li>
            <Link href="/contact" className="underline">
              お問い合わせフォーム
            </Link>
          </li>
        </ul>
      </Section>
    </MobileFrame>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 text-[13px] leading-[1.8]">
      <h2 className="text-[16px] font-extrabold mb-2">{title}</h2>
      <div className="text-goukaku-ink/85">{children}</div>
    </section>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="mb-2 border border-goukaku-divider rounded-[8px] px-3 py-2">
      <summary className="cursor-pointer font-extrabold text-[13px]">
        Q. {q}
      </summary>
      <div className="mt-2 text-[13px] text-goukaku-ink/85 leading-[1.8]">
        {children}
      </div>
    </details>
  );
}
