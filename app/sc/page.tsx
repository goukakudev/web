import type { Metadata } from "next"
import Link from "next/link"
import { listScExams, listScPopularTags } from "@/lib/api-client"
import { makeMetadata } from "@/lib/seo/metadata"
import {
  itemListJsonLd,
  courseJsonLd,
  webPageJsonLd,
  SITE_URL,
} from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { ScHairline, ScSectionHead, ScTopBar } from "@/components/sc/ScChrome"
import { ScHero } from "@/components/sc/ScHero"
import { ScTodayCTA } from "@/components/sc/ScTodayCTA"
import { ScPopularTags } from "@/components/sc/ScPopularTags"
import { ScYearLedger } from "@/components/sc/ScYearLedger"

export const metadata: Metadata = makeMetadata({
  title: "情報処理安全確保支援士試験 過去問 + 解説 (SC・登録セキスペ)",
  description:
    "情報処理安全確保支援士試験 (SC、登録セキスペ) の午前 II 過去問を無料で。順番に / ランダムに / 模試形式 (40 分) で解け、全問解説・選択肢ごとの解説・ヒント付き。",
  path: "/sc",
})

export default async function ScHomePage() {
  const [exams, tags] = await Promise.all([listScExams(), listScPopularTags(12)])

  if (exams.length === 0) {
    return <ScPreparingHome />
  }

  const sortedExams = [...exams].sort((a, b) => (a.exam_id < b.exam_id ? 1 : -1))
  const firstExam = sortedExams[0]

  return (
    <main className="sc-page">
      <ScTopBar
        title="情報処理安全確保支援士"
        leading={<MenuButton />}
        trailing={
          <Link href="/sc/bookmarks" className="sc-icon-btn" aria-label="ブックマーク">
            <BookmarkIcon />
          </Link>
        }
      />
      <h1 className="sr-only">情報処理安全確保支援士試験 過去問</h1>
      <JsonLd
        data={itemListJsonLd(
          sortedExams.map((e) => ({
            name: `${e.title ?? e.exam_id} 過去問`,
            url: `${SITE_URL}/sc/exam/${e.exam_id}`,
          })),
        )}
      />
      <JsonLd
        data={courseJsonLd({
          name: "情報処理安全確保支援士試験 過去問学習コース",
          description:
            "情報処理安全確保支援士試験 (SC) 午前 II の公開過去問を解説・ヒント付きで無料演習。情報セキュリティ技術・管理・関連法規の分野別学習に対応。",
          url: `${SITE_URL}/sc`,
          aboutName: "情報処理安全確保支援士試験",
          examYears: "公開過去問",
          totalQuestions: sortedExams.reduce((s, e) => s + (e.question_count ?? 0), 0),
          credentialName: "情報処理安全確保支援士",
        })}
      />

      <ScHero />

      <ScSectionHead title="今日の演習" />
      <ScTodayCTA
        href="/sc/play/random?count=20"
        title="ランダム試験にチャレンジ"
        subtitle="全範囲から 20 問をピックアップ"
      />

      {firstExam && (
        <>
          <ScSectionHead title="本番形式の模試" />
          <ScTodayCTA
            href={`/sc/play/${firstExam.exam_id}?mode=exam`}
            title={`模試 40 分 / 25 問`}
            subtitle={`${firstExam.title ?? firstExam.exam_id} を本番想定で`}
          />
        </>
      )}

      <ScSectionHead
        title="人気タグ"
        trailingHref={`/sc/category/security-tech`}
        trailingLabel="すべて見る"
      />
      <ScPopularTags tags={tags} />

      <ScSectionHead title="年別 過去問" />
      <ScYearLedger exams={sortedExams} />

      <ScSectionHead title="情報処理安全確保支援士試験について" />
      <ScHairline />
      <section className="sc-prose" style={{ padding: "1.25rem 1.375rem 2.5rem" }}>
        <p>
          情報処理安全確保支援士試験 (SC) は、独立行政法人情報処理推進機構 (IPA) が実施するレベル 4 の高度試験です。試験合格と登録手続きを経ると、サイバーセキュリティ基本法に基づく国家資格『情報処理安全確保支援士 (通称『登録セキスペ』)』として活動できます。
        </p>
        <p>
          合格.dev では<strong>午前 II (40 分・25 問・多肢選択)</strong> の公開過去問を、選択肢ごとの解説とヒント付きで演習できます。受験計画や試験範囲は学習ガイドにまとめています。
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <Link href="/sc/guide" className="sc-pill" data-variant="filled">
            📘 SC 学習ガイド
          </Link>
          <Link href="/sc/faq" className="sc-pill">
            ❓ SC FAQ
          </Link>
          <Link href="/sc/category/security-tech" className="sc-pill">
            分野別 過去問
          </Link>
        </div>
      </section>
    </main>
  )
}

function ScPreparingHome() {
  return (
    <main className="sc-page">
      <ScTopBar title="情報処理安全確保支援士" leading={<MenuButton />} />
      <JsonLd
        data={webPageJsonLd({
          name: "情報処理安全確保支援士試験 (SC) 学習ガイド・FAQ",
          url: `${SITE_URL}/sc`,
          description:
            "情報処理安全確保支援士試験 (SC) の試験概要・出題範囲・合格基準・午前 I 免除・登録制度を独自編集で解説。過去問演習は準備中。",
        })}
      />

      <section className="sc-status-banner">
        <div className="sc-status-banner-label">STATUS</div>
        <div className="sc-status-banner-title">過去問演習は準備中</div>
        <div className="sc-status-banner-body">
          合格.dev では、情報処理安全確保支援士試験 (SC) の<strong>学習ガイドと FAQ を先行公開</strong>しています。午前 II の公開過去問演習は現在編集部で準備を進めており、整備が完了次第このページから 3 モード (順番 / ランダム / 40 分模試) で演習できるようになります。
        </div>
        <div className="sc-status-banner-actions">
          <Link href="/sc/guide" className="sc-pill" data-variant="filled">
            📘 SC 学習ガイドを読む →
          </Link>
          <Link href="/sc/faq" className="sc-pill">
            ❓ SC FAQ
          </Link>
        </div>
      </section>

      <ScSectionHead title="情報処理安全確保支援士試験について" />
      <ScHairline />
      <section className="sc-prose" style={{ padding: "1.25rem 1.375rem 2.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-sc-ink)", marginBottom: "0.5rem", letterSpacing: "0.02em" }}>
          情報処理安全確保支援士試験 (SC)
        </h1>
        <p style={{ color: "var(--color-sc-t2)", letterSpacing: "0.16em", fontSize: "0.6875rem", fontWeight: 700, marginBottom: "1rem" }}>
          REGISTERED INFORMATION SECURITY SPECIALIST
        </p>
        <p>
          情報処理安全確保支援士試験 (SC) は、独立行政法人情報処理推進機構 (IPA) が実施する経済産業省管轄の国家試験で、情報処理技術者試験の<strong>レベル 4 (高度試験)</strong> に位置付けられます。試験合格と所定の登録手続きを経ると、サイバーセキュリティ基本法に基づく国家資格『情報処理安全確保支援士』として活動できます。
        </p>

        <h2>試験構成 (令和 6 年度以降)</h2>
        <ul>
          <li><strong>午前 I</strong> — 50 分・30 問・多肢選択 (応用情報レベルの基礎、免除制度あり)</li>
          <li><strong>午前 II</strong> — 40 分・25 問・多肢選択 (SC 専門知識、情報セキュリティが約 6 割)</li>
          <li><strong>午後</strong> — 150 分・記述式 (4 問から 3 問選択)</li>
        </ul>

        <h2>合格基準・合格率・受験スケジュール</h2>
        <p>
          合格基準は<strong>各区分すべてで 100 点満点中 60 点以上</strong>。合格率は例年 17〜21% 前後で、高度試験のなかでは比較的高めです。試験は<strong>年 2 回 (春期 4 月・秋期 10 月)</strong> の会場ペーパー方式 (PBT) で実施され、受験料は税込 7,500 円です。
        </p>

        <h2>午前 I 免除制度</h2>
        <p>
          応用情報技術者試験 (AP) 合格者、または高度試験 (SC・NW・DB・ES・SA・ST・SM・PM・AU) のいずれかの合格者は、<strong>合格から 2 年間</strong>、午前 I の受験が免除されます。
        </p>

        <h2>登録制度 (国家資格)</h2>
        <p>
          試験合格と登録は別の手続きです。登録には<strong>登録手数料 10,700 円・登録免許税 9,000 円</strong>と、登録後の<strong>毎年のオンライン講習 (約 2 万円)・3 年に 1 度の実践講習 (約 8 万円)</strong> の受講が義務付けられます。
        </p>

        <h2>関連する試験</h2>
        <p>
          SC の前段として、<Link href="/sg">情報セキュリティマネジメント試験 (SG)</Link>、午前 I の免除を取れる <Link href="/ap">応用情報技術者試験 (AP)</Link>、テクノロジ系の基礎を固める <Link href="/fe">基本情報技術者試験 (FE)</Link> の演習が役立ちます。
        </p>

        <h2>コンテンツの独自性について</h2>
        <p>
          本ページおよび <Link href="/sc/guide">SC 学習ガイド</Link>・<Link href="/sc/faq">FAQ</Link> の文章は、すべて合格.dev 編集部が IPA 公表資料と公式シラバスを参照しつつ独自に書き起こした二次著作物であり、IPA の公式見解ではありません。詳しくは{" "}
          <Link href="/about">編集方針</Link>{" / "}
          <Link href="/methodology">編集方針 (詳細)</Link>{" / "}
          <Link href="/sources">出典一覧</Link>{" / "}
          <Link href="/privacy">プライバシーポリシー</Link>{" / "}
          <Link href="/terms">利用規約</Link> をご覧ください。
        </p>
      </section>
    </main>
  )
}

function MenuButton() {
  return (
    <Link href="/" className="sc-icon-btn" aria-label="合格.dev トップ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M3 12h18" />
        <path d="M3 6h18" />
        <path d="M3 18h18" />
      </svg>
    </Link>
  )
}

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}
