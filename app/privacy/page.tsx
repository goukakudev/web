import type { Metadata } from "next";
import Link from "next/link";
import { MobileFrame } from "@/components/layout/MobileFrame";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "合格.dev (Web / iOS アプリ群: 合格.dev / 宅建合格.dev など) のプライバシーポリシー。Google AdSense のクッキー利用、localStorage / UserDefaults に保存する情報、サーバーへ送信される情報 (匿名 device_id / Good・Bad 評価 / 問題報告本文)、第三者サービス (Cloudflare R2 / Vercel) について明記します。",
  alternates: { canonical: "/privacy" },
};

const REVISED = "2026-05-22";
const CONTACT_EMAIL = "contact@goukaku.dev";

export default function PrivacyPage() {
  return (
    <MobileFrame>
      <Link href="/" className="inline-block text-[14px] mb-4">
        ← ホーム
      </Link>
      <h1 className="text-[24px] font-extrabold mb-2">プライバシーポリシー</h1>
      <p className="text-[12px] text-goukaku-ink/55 mb-6">最終更新日: {REVISED}</p>

      <Section title="1. 適用範囲">
        <p>
          本ポリシーは、合格.dev (以下「当サイト」) および当サイトが提供する iOS アプリ群 (基本情報技術者試験向けの「合格.dev」、宅地建物取引士試験向けの「宅建合格.dev」を含み、以下これらを総称して「本アプリ」といいます) を利用するにあたって、利用者の情報をどのように取り扱うかを明記するものです。当サイトが今後追加する関連 Web サービス・iOS アプリにも、特段の断りがない限り本ポリシーが適用されます。
        </p>
      </Section>

      <Section title="2. 当サイト・本アプリが取得しない情報">
        <ul className="list-disc pl-5 space-y-1">
          <li>氏名、住所、電話番号などの個人情報は一切取得しません。</li>
          <li>会員登録・サインアップ機能はありません。</li>
          <li>パスワードや認証情報の保存はありません。</li>
          <li>広告識別子 (IDFA) や、利用者を複数アプリ・サイトにまたがって追跡するためのトラッキング機能は使用しません。</li>
        </ul>
      </Section>

      <Section title="3. ブラウザの localStorage に保存する情報">
        <p>
          学習体験の継続性のため、訪問者のブラウザの localStorage に以下の情報を保存します。いずれも個人を特定する情報を含みません。一部の情報は §5 に記載の機能を利用する場合にのみ当サイトのサーバーへ送信されます。
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <code>examquiz.device_id.v1</code> / <code>tk_device_id</code>: ブラウザ初回アクセス時にランダム生成される識別子 (UUID)。学習履歴を端末単位で集計するためのみに使用します。
          </li>
          <li>
            <code>examquiz.answers.v1</code> / <code>tk_attempts</code>: 解答した問題 ID、選択肢、正誤、解答時刻。
          </li>
          <li>
            <code>examquiz.sessions.v1</code>: 模試モードで終了したセッションの結果 (正解数 / 経過時間)。
          </li>
          <li>
            <code>examquiz.pending.v1</code>: 通信失敗時にあとから送信するための解答ログのキュー。
          </li>
          <li>
            <code>tk_bookmarks</code>: ブックマークした問題 ID の一覧。
          </li>
          <li>
            <code>tk_votes</code>: 各問題に対する Good / Bad 評価の状態。
          </li>
        </ul>
        <p className="mt-2">
          これらはすべてブラウザの「サイトデータを削除」操作でクリアできます。
        </p>
      </Section>

      <Section title="4. iOS アプリが端末内に保存する情報">
        <p>
          iOS アプリ版は学習体験の継続性のため、iOS の <code>UserDefaults</code> および SwiftData に以下の情報を保存します。以下の情報は端末内のみで利用し、Apple のサーバーには送信しません。当サイトのサーバーへの送信は §5 に記載した機能を利用したときに限ります。
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <code>device_id</code> / <code>tk_device_id</code>: アプリ初回起動時にランダム生成される識別子 (UUID)。学習履歴を端末単位で集計するためのみに使用します。広告識別子 (IDFA) は一切使用しません。
          </li>
          <li>
            解答履歴: 解答した問題 ID、選択肢、正誤、解答時刻。
          </li>
          <li>
            セッション結果: 模試モードで終了したセッションの結果 (正解数 / 経過時間)。
          </li>
          <li>
            環境設定: テーマ設定 (自動 / ライト / ダーク) など。
          </li>
          <li>
            ブックマーク: ユーザーがブックマークした問題 ID の一覧。
          </li>
          <li>
            問題報告のローカル保存: 「問題を報告」フォームに入力した本文 (送信成否にかかわらず履歴として端末内に保持)。
          </li>
          <li>
            問題データのオフラインキャッシュ (端末ローカルファイル)。
          </li>
        </ul>
        <p className="mt-2">
          これらの情報は、アプリ内の「学習履歴をすべて削除」操作、あるいはアプリ自体の削除によって完全に削除できます。
        </p>
      </Section>

      <Section title="5. 当サイト・本アプリのサーバーへ送信される情報">
        <p>
          当サイト・本アプリは、以下の場面に限り、最小限の情報を当サイトのサーバー (<code>goukaku.dev</code> / <code>api.goukaku.dev</code>) へ送信します。送信される情報には氏名・メールアドレス等の直接的な個人情報は含まれません (利用者が問題報告フォーム等に任意で記入した場合を除く)。
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>問題データの取得</strong>: 試験問題や解説の取得時、サーバーは IP アドレス・User-Agent などの一般的なアクセスログを記録します。これらは運用 (不正アクセス対策、性能改善) 目的でのみ使用します。
          </li>
          <li>
            <strong>解答ログ送信</strong> (Web 版および将来的に iOS 版で有効化される機能): 匿名の <code>device_id</code>、問題 ID、試験 ID、選択した選択肢、正誤、解答時刻 (ISO8601)、任意のセッション ID。出題傾向の集計・難易度分析・サービス改善のために利用します。
          </li>
          <li>
            <strong>Good / Bad 評価</strong>: 利用者が解説の「Good」「Bad」ボタンを押した場合、匿名の <code>device_id</code>、問題 ID、試験 ID、評価値 (<code>good</code> / <code>bad</code> / 取消)、操作時刻を送信します。同一端末からの最新の評価のみを集計に反映し、過去の評価は履歴として保持します。
          </li>
          <li>
            <strong>問題報告 / お問い合わせフォーム</strong>: 利用者が任意で入力した本文と、付随する技術情報 (該当問題 ID、試験 ID、アプリバージョン等) を送信します。本文には氏名・メールアドレス等の入力は不要です。返信を希望する場合に限り、利用者の判断でメールアドレスを記入できます。
          </li>
        </ul>
        <p className="mt-2">
          利用者を継続的に追跡する目的のトラッキング機能、第三者への販売、アフィリエイト目的の利用は一切行いません。
        </p>
      </Section>

      <Section title="6. データの保管期間">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            解答ログ / Good・Bad 評価 / 問題報告: 出題改善・解説品質改善を目的として、原則 <strong>3 年間</strong> 保管します。保管期間経過後は削除するか、個人を特定し得ない集計値に変換します。
          </li>
          <li>
            アクセスログ (IP アドレス / User-Agent): 運用目的で原則 <strong>90 日間</strong> 保管します。
          </li>
          <li>
            端末内に保存される情報 (localStorage / UserDefaults / SwiftData): 利用者自身が削除するまで端末内に残ります。当サイト側で削除することはできません。
          </li>
        </ul>
      </Section>

      <Section title="7. Apple App Store「App Privacy」表示との対応">
        <p>
          本アプリの App Store「データの種類」表示は以下のとおりです。すべて<strong>利用者の身元には紐付けず</strong>、<strong>追跡には使用しません</strong>。
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>識別子 - ユーザー ID</strong>: 匿名の <code>device_id</code> (UUID)。用途: 分析、アプリの機能。
          </li>
          <li>
            <strong>ユーザーコンテンツ - その他のユーザーコンテンツ</strong>: お問い合わせ / 問題報告フォームに入力された本文。用途: アプリの機能。
          </li>
          <li>
            <strong>使用状況データ - 製品操作</strong>: Good / Bad 評価、解答結果、模試モードのセッション結果。用途: 分析、アプリの機能。
          </li>
          <li>
            <strong>診断 - パフォーマンスデータ・その他の診断データ</strong>: アクセスログ (IP アドレス、User-Agent 等)。用途: アプリの機能。
          </li>
        </ul>
      </Section>

      <Section title="8. Cookie について">
        <p>
          当サイト自体はトラッキング目的の Cookie を発行していません。ただし、後述する Google AdSense などの第三者配信サービスにより Cookie が利用される場合があります。
        </p>
      </Section>

      <Section title="9. 第三者配信の広告サービスについて">
        <p>
          当サイトは Google AdSense などの第三者配信事業者の広告を掲載することがあります (掲載開始後)。これらの広告配信事業者は、訪問者の興味に応じた広告を表示するため、Cookie などを使用してアクセス情報を収集することがあります。なお、iOS アプリ版には現時点で広告掲載はありません。
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

      <Section title="10. 利用している第三者サービス">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Vercel</strong> — Web サイトのホスティング、CDN、サーバーレス関数の実行。アクセスログ (IP アドレス、User-Agent 等) が運営目的で保持されます。
          </li>
          <li>
            <strong>Cloudflare R2 / CDN</strong> — 図表画像の配信。エッジでのキャッシュ統計やアクセスログが処理されます。
          </li>
          <li>
            <strong>Google AdSense</strong> — 広告配信 (将来掲載予定。iOS アプリ版では使用しません)。
          </li>
        </ul>
      </Section>

      <Section title="11. アクセス解析">
        <p>
          現時点で Google Analytics や同等のアクセス解析ツールは導入していません。将来導入する場合は本ポリシーを更新します。
        </p>
      </Section>

      <Section title="12. 利用者の権利と削除請求">
        <p>
          利用者は、当サイト・本アプリが保有する自身に関するデータについて以下の権利を有します。
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            端末内に保存された情報は、ブラウザの「サイトデータを削除」操作、iOS アプリ内の「学習履歴をすべて削除」操作、またはアプリ自体の削除によって、いつでも完全に削除できます。
          </li>
          <li>
            サーバー側に送信された情報 (解答ログ / Good・Bad 評価 / 問題報告) について、開示・訂正・削除を希望する場合は、§14 のお問い合わせ窓口までご連絡ください。本人確認のため、対象の <code>device_id</code> をお知らせいただきます。当該 <code>device_id</code> に紐付くサーバー側データを合理的な範囲で削除します。
          </li>
        </ul>
      </Section>

      <Section title="13. 免責事項">
        <p>
          当サイト・本アプリに掲載する問題および解説は、独立行政法人情報処理推進機構 (IPA) または一般財団法人不動産適正取引推進機構が公表する過去問題を元に独自に編集したものです。内容の正確性には最善を尽くしていますが、誤りや古い情報が含まれる可能性があります。本サイト・本アプリの利用により生じたいかなる損害についても、運営者は責任を負いません。
        </p>
      </Section>

      <Section title="14. お問い合わせ">
        <p>
          本ポリシーに関するお問い合わせ、開示・削除請求等は、{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              "プライバシーポリシーに関するお問い合わせ - 合格.dev",
            )}`}
            className="underline font-extrabold"
          >
            {CONTACT_EMAIL}
          </a>
          {" "}まで、または{" "}
          <Link href="/contact" className="underline">
            お問い合わせページ
          </Link>{" "}
          / {" "}
          <Link href="/support" className="underline">
            サポートページ
          </Link>{" "}
          からお願いします。
        </p>
      </Section>

      <Section title="15. 改訂履歴">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            2026-05-22: 「宅建合格.dev」iOS アプリ公開に伴う改訂。適用範囲を当サイトの iOS アプリ群に拡張、サーバへ送信される情報 (Good / Bad 評価、問題報告本文) を明記、データ保管期間の記載 (§6) と利用者の削除請求権の記載 (§12) を追加。
          </li>
          <li>2026-05-19: iOS アプリ「合格.dev」公開に伴う改訂 (iOS UserDefaults / App Privacy 表示の追記)。</li>
          <li>2026-05-18: 初版公開。</li>
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
