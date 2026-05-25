import type { Metadata } from "next";
import Link from "next/link";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

const CONTACT_EMAIL = "contact@goukaku.dev";

export const metadata: Metadata = {
  title: "サポート",
  description:
    "合格.dev (Web / iOS アプリ) のサポートページ。対応試験 (基本情報技術者試験・宅建士 ほか) のよくある質問と問い合わせ先をまとめています。",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  const mailto = (subject: string) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "サポート", href: "/support" },
      ]} />
      <h1 className="text-[24px] font-extrabold mb-2">サポート</h1>
      <p className="text-[13px] text-goukaku-ink/70 mb-6 leading-[1.7]">
        各種資格試験の過去問演習サービス <strong>合格.dev</strong>{" "}
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

      <Section title="対応試験">
        <p>現時点で 合格.dev が対応している試験は以下のとおりです。</p>
        <div className="space-y-5 mt-3">
          <ExamCard
            title="基本情報技術者試験 (FE)"
            description="科目A の過去問・解説。令和7年度春期 から 平成25年度春期 まで・約 800 問以上収録。"
            webHref="/fe"
            webLabel="FE トップ (Web)"
            appStoreUrl="https://apps.apple.com/jp/app/id6753257968"
            appStoreAlt="基本情報技術者試験 合格.dev を App Store でダウンロード"
          />
          <ExamCard
            title="宅地建物取引士試験 (宅建)"
            description="4分野 (権利関係 / 宅建業法 / 法令上の制限 / 税その他) の過去問・解説。平成16年度 から 令和7年度 まで・1,200 問以上収録。"
            webHref="/takken"
            webLabel="宅建トップ (Web)"
            comingSoonLabel="iOS アプリ近日公開予定"
          />
        </div>
        <p className="mt-4 text-[12px] text-goukaku-ink/60">
          ※
          今後、他の国家資格・検定試験についても順次対応を予定しています。リクエストは{" "}
          <a href={mailto("試験追加リクエスト - 合格.dev")} className="underline">
            メール
          </a>{" "}
          にてお気軽にお寄せください。
        </p>
      </Section>

      <Section title="よくある質問">
        <Faq q="どの試験に対応していますか?">
          上記「対応試験」セクションをご覧ください。Web 版・iOS
          アプリそれぞれで対応試験が異なる場合があります (詳細は各試験ページ参照)。
          他試験のリリース予定や対応状況については随時このページで更新します。
        </Faq>
        <Faq q="アプリ・サービスは無料ですか?">
          はい、Web
          版・iOS アプリともに完全無料でご利用いただけます。アプリ内課金もありません。広告は将来掲載する可能性がありますが、現時点では表示していません。
        </Faq>
        <Faq q="アカウント登録は必要ですか?">
          不要です。Web 版はブラウザを開くだけ、iOS
          アプリは起動するだけですぐに学習を始められます。学習履歴はすべてご利用の端末
          (ブラウザ または iOS アプリ) 内にのみ保存されます。
        </Faq>
        <Faq q="学習履歴をリセットしたいです">
          <strong>iOS アプリ:</strong>{" "}
          ホーム画面下部の「設定」セクションにある「データをリセット」ボタンを使用してください。解答履歴・模試結果・キャッシュをすべて削除します。
          <br />
          <strong>Web 版:</strong>{" "}
          ブラウザの設定からサイトデータ (Cookie / LocalStorage)
          を削除してください。または各試験トップの「設定」からリセットできる場合があります。
        </Faq>
        <Faq q="模試モードとは?">
          本番形式を模した出題モードです。試験ごとに本試験と同じ制限時間で出題されます。
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>基本情報技術者試験:</strong> 90 分タイマー
            </li>
            <li>
              <strong>宅建士試験:</strong> 2時間タイマー・50問・合格ライン判定付き
            </li>
          </ul>
          時間切れの場合も強制的に採点画面に遷移します。
        </Faq>
        <Faq q="模試モード中に Good / Bad / 問題報告ボタンが表示されません">
          本番に集中していただくため、模試モード中はフィードバックボタンを意図的に非表示にしています。通常の演習モード
          (年度別・分野別等) では表示されます。
        </Faq>
        <Faq q="問題の誤りを見つけました">
          各問題画面下部の<strong>「問題を報告」</strong>{" "}
          ボタンからご報告ください。または{" "}
          <a href={mailto("問題報告 - 合格.dev")} className="underline">
            {CONTACT_EMAIL}
          </a>{" "}
          まで直接ご連絡いただいても構いません。問題 ID
          (画面上部のヘッダーに表示) を添えていただけると確認がスムーズです。
        </Faq>
        <Faq q="オフラインで使えますか?">
          <strong>iOS アプリ:</strong>{" "}
          全問題・解説をアプリにバンドルしているため、インターネット接続なしで全機能を利用できます。
          <br />
          <strong>Web 版:</strong>{" "}
          一度開いた試験データはブラウザにキャッシュされ、機内モードでも一定範囲は再演習できます。新しい試験データの取得時にはインターネット接続が必要です。
        </Faq>
        <Faq q="ダークモードに切り替えたい">
          <strong>iOS アプリ:</strong>{" "}
          ホーム画面下部の「設定」セクションの「テーマ」
          (自動 / ライト / ダーク) から切り替えられます。「自動」は iOS のシステム設定に追従します。
          <br />
          <strong>Web 版:</strong>{" "}
          OS / ブラウザのダークモード設定に自動追従します。
        </Faq>
        <Faq q="iPad で使えますか?">
          はい、iPad
          にも完全対応しています。大画面でも快適に学習できるよう最適化しています。
        </Faq>
        <Faq q="動作環境は?">
          <strong>iOS アプリ:</strong> iOS 17 以降を推奨。
          <br />
          <strong>Web 版:</strong>{" "}
          モダンブラウザ (Safari / Chrome / Edge / Firefox の最新2世代) に対応。
        </Faq>
        <Faq q="個人情報は収集されますか?">
          氏名・住所・メールアドレス等の個人情報は一切収集しません。詳細は{" "}
          <Link href="/privacy" className="underline">
            プライバシーポリシー
          </Link>{" "}
          をご覧ください。
        </Faq>
        <Faq q="他の試験 (○○検定・○○士試験) には対応する予定はありますか?">
          合格.dev は試験ごとにデータを追加する設計になっており、技術的にはあらゆる選択式試験への対応が可能です。需要や問題データの入手性を踏まえて優先順位を決めていますので、ご希望の試験がありましたら{" "}
          <a href={mailto("試験追加リクエスト - 合格.dev")} className="underline">
            メール
          </a>{" "}
          でお気軽にお知らせください。
        </Faq>
      </Section>

      <Section title="不具合報告のコツ">
        <p>不具合報告の際は以下の情報を含めていただけると、早く解決できます。</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>対象試験 (例: 基本情報技術者試験 / 宅建士)</li>
          <li>利用環境 (iOS アプリ / Web 版)</li>
          <li>端末モデル (例: iPhone 15 Pro, iPad Pro 13", MacBook Air)</li>
          <li>OS / ブラウザのバージョン (iOS 17.4 / Safari 17 等)</li>
          <li>アプリのバージョン (iOS アプリの場合)</li>
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
            <Link href="/terms" className="underline">
              利用規約
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

function ExamCard({
  title,
  description,
  webHref,
  webLabel,
  appStoreUrl,
  appStoreAlt,
  comingSoonLabel,
}: {
  title: string;
  description: string;
  webHref: string;
  webLabel: string;
  appStoreUrl?: string;
  appStoreAlt?: string;
  comingSoonLabel?: string;
}) {
  return (
    <div className="border border-goukaku-divider rounded-[10px] p-4">
      <p className="font-extrabold text-[14px] mb-1">{title}</p>
      <p className="text-[12.5px] text-goukaku-ink/75 leading-[1.7] mb-3">
        {description}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={webHref}
          className="inline-flex items-center px-3 py-2 rounded-[6px] border border-goukaku-divider text-[12px] font-bold hover:bg-goukaku-ink/5"
        >
          {webLabel} →
        </Link>
        {appStoreUrl && appStoreAlt ? (
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={appStoreAlt}
            className="inline-block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/ja-jp?releaseDate=1746489600"
              alt={appStoreAlt}
              width={135}
              height={40}
              style={{ height: 40, width: "auto" }}
              loading="lazy"
            />
          </a>
        ) : comingSoonLabel ? (
          <span className="inline-flex items-center px-3 py-2 rounded-[6px] bg-goukaku-ink/10 text-[12px] text-goukaku-ink/60">
            {comingSoonLabel}
          </span>
        ) : null}
      </div>
    </div>
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
