import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { courseJsonLd, webPageJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

export const metadata: Metadata = makeMetadata({
  title: "情報処理安全確保支援士試験 (SC) 学習ガイド・FAQ",
  description:
    "情報処理安全確保支援士試験 (SC、登録セキスペ) の試験概要・出題範囲・合格基準・午前 I 免除制度・登録制度・標準学習スケジュール・分野別攻略をまとめた独自編集の学習ガイドと FAQ を公開中。過去問演習と iOS アプリは現在準備中。",
  path: "/sc",
})

export default function ScHomePage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
      ]} />
      <JsonLd
        data={webPageJsonLd({
          name: "情報処理安全確保支援士試験 (SC) 学習ガイド・FAQ",
          url: `${SITE_URL}/sc`,
          description:
            "情報処理安全確保支援士試験 (SC) の試験概要・出題範囲・合格基準・午前 I 免除・登録制度を独自編集で解説。過去問演習と iOS アプリは準備中。",
        })}
      />
      <JsonLd
        data={courseJsonLd({
          name: "情報処理安全確保支援士試験 学習ガイド",
          description:
            "情報処理安全確保支援士試験 (SC) の試験概要・午前 I/II・午後・合格基準・午前 I 免除・登録制度・分野別攻略の独自編集ガイド。",
          url: `${SITE_URL}/sc`,
          aboutName: "情報処理安全確保支援士試験",
          examYears: "現行制度 (令和 6 年度以降)",
          credentialName: "情報処理安全確保支援士",
        })}
      />

      <h1 className="text-[24px] font-extrabold leading-[1.3] mb-2">
        情報処理安全確保支援士試験 (SC)
      </h1>
      <p className="text-[12px] text-goukaku-ink/55 mb-5 tracking-widest">
        Registered Information Security Specialist
      </p>

      <section className="mb-6 rounded-2xl border border-goukaku-divider bg-goukaku-surface p-5">
        <p className="text-[11px] font-bold tracking-[0.16em] text-goukaku-ink/55">
          STATUS
        </p>
        <p className="mt-2 text-[16px] font-extrabold leading-[1.45]">
          過去問演習・iOS アプリは現在準備中
        </p>
        <p className="mt-3 text-[12.5px] leading-[1.85] text-goukaku-ink/75">
          合格.dev では、情報処理安全確保支援士試験 (SC) の<strong>学習ガイドと FAQ を先行公開</strong>しています。午前 II の公開過去問演習と iOS アプリは現在編集部で準備を進めており、整備が完了次第このページからアクセスできるようになります。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/sc/guide"
            className="inline-flex items-center rounded-full border border-goukaku-divider bg-goukaku-surface px-3.5 py-1.5 text-[12px] font-extrabold text-goukaku-ink/80 hover:text-goukaku-ink"
          >
            📘 SC 学習ガイドを読む →
          </Link>
          <Link
            href="/sc/faq"
            className="inline-flex items-center rounded-full border border-goukaku-divider bg-goukaku-surface px-3.5 py-1.5 text-[12px] font-extrabold text-goukaku-ink/80 hover:text-goukaku-ink"
          >
            ❓ SC FAQ
          </Link>
        </div>
      </section>

      <section className="mt-8 text-[13px] leading-[1.85] text-goukaku-ink/85">
        <h2 className="text-[18px] font-extrabold mb-3">情報処理安全確保支援士試験について</h2>
        <p className="mb-3">
          情報処理安全確保支援士試験(略称 SC) は、独立行政法人情報処理推進機構 (IPA) が実施する経済産業省管轄の国家試験で、情報処理技術者試験の<strong>レベル 4 (高度試験)</strong> に位置付けられます。試験合格と所定の登録手続きを経ると、サイバーセキュリティ基本法に基づく国家資格『情報処理安全確保支援士』(通称『支援士』『登録セキスペ』) として活動できます。IT 分野で唯一の登録制度付き情報セキュリティ国家資格です。
        </p>

        <h3 className="text-[15px] font-extrabold mt-5 mb-2">試験構成 (令和 6 年度以降)</h3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>
            <strong>午前 I</strong> — 50 分・30 問・多肢選択 (応用情報レベルの基礎、免除制度あり)
          </li>
          <li>
            <strong>午前 II</strong> — 40 分・25 問・多肢選択 (SC 専門知識、情報セキュリティが約 6 割)
          </li>
          <li>
            <strong>午後</strong> — 150 分・記述式 (4 問から 3 問選択、Web / ネットワーク / 認証 / インシデント対応 / マネジメント)
          </li>
        </ul>

        <h3 className="text-[15px] font-extrabold mt-5 mb-2">合格基準・合格率・受験スケジュール</h3>
        <p className="mb-3">
          合格基準は<strong>各区分すべてで 100 点満点中 60 点以上</strong>。合格率は例年 17〜21% 前後で、高度試験のなかでは比較的高めです。試験は<strong>年 2 回 (春期 4 月・秋期 10 月)</strong> の会場ペーパー方式 (PBT) で実施され、受験料は税込 7,500 円です。
        </p>

        <h3 className="text-[15px] font-extrabold mt-5 mb-2">午前 I 免除制度</h3>
        <p className="mb-3">
          応用情報技術者試験 (AP) 合格者、または高度試験 (SC・NW・DB・ES・SA・ST・SM・PM・AU) のいずれかの合格者は、<strong>合格から 2 年間</strong>、午前 I の受験が免除されます。多くの SC 受験者がこの免除を活用し、当日は午前 II からスタートします。
        </p>

        <h3 className="text-[15px] font-extrabold mt-5 mb-2">登録制度 (国家資格)</h3>
        <p className="mb-3">
          試験合格と登録は別の手続きです。登録には<strong>登録手数料 10,700 円・登録免許税 9,000 円</strong>と、登録後の<strong>毎年のオンライン講習 (約 2 万円)・3 年に 1 度の実践講習 (約 8 万円)</strong> の受講が義務付けられます。名称を業務で活用する予定の方は登録を、合格資格と午前 I 免除のみで十分な方は登録を見送る判断もできます。
        </p>

        <h3 className="text-[15px] font-extrabold mt-5 mb-2">関連する試験</h3>
        <p className="mb-3">
          SC の前段として、情報セキュリティ管理の入門である <Link href="/sg" className="underline">情報セキュリティマネジメント試験 (SG)</Link> や、午前 I の免除を取れる <Link href="/ap" className="underline">応用情報技術者試験 (AP)</Link>、テクノロジ系の基礎を固める <Link href="/fe" className="underline">基本情報技術者試験 (FE)</Link> の演習が役立ちます。現在演習が準備中の SC に対し、これら関連区分は合格.dev で過去問演習が可能です。
        </p>

        <h3 className="text-[15px] font-extrabold mt-5 mb-2">コンテンツの独自性について</h3>
        <p className="mb-3">
          本ページおよび <Link href="/sc/guide" className="underline">SC 学習ガイド</Link>・<Link href="/sc/faq" className="underline">FAQ</Link> の文章は、すべて合格.dev 編集部が IPA 公表資料と公式シラバスを参照しつつ独自に書き起こした二次著作物であり、IPA の公式見解ではありません。生成 AI による下書きは補助として用いる場合がありますが、最終的な公開コンテンツは人手で校正しています。詳しくは{" "}
          <Link href="/about" className="underline">編集方針</Link>
          {" / "}
          <Link href="/methodology" className="underline">編集方針 (詳細)</Link>
          {" / "}
          <Link href="/sources" className="underline">出典一覧</Link>
          {" / "}
          <Link href="/privacy" className="underline">プライバシーポリシー</Link>
          {" / "}
          <Link href="/terms" className="underline">利用規約</Link>
          {" "}をご覧ください。
        </p>
      </section>
    </MobileFrame>
  )
}
