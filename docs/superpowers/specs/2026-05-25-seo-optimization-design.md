# goukaku.dev SEO 強化設計

- 作成日: 2026-05-25
- 対象: `web/` (Next.js 16.2.6 + React 19 + Tailwind v4) — https://goukaku.dev
- 方針: 1本の設計書で全体像を定義し、実装は Phase 1〜5 に分割して順次リリース(B案)。

---

## 1. ゴール・スコープ・非ゴール

### 主目標
- goukaku.dev の全体オーガニック流入を、IP / FE / 宅建 すべてにわたって大幅に増やす。
- 既存約 4,000+ の問題ページに加え、新規 SEO コンテンツ群(FAQ・用語集・学習ガイド・年度別・分野別サマリー)を全てインデックス対象とし、ロングテール・ミドル・ヘッド(ビッグ KW)を多層で押さえる。

### 成功基準(設計時点で検証可能なもの)
- 全ページに正しい `canonical` / OG / Twitter / 構造化データ(JSON-LD)が出力される。
- 宅建セクションが FE / IP と同等の SEO 構造に到達する。
- `sitemap.xml` が全インデックス対象 URL(問題・タグ・年度・分野・FAQ・用語・ガイド)を正しく出力する。
- Lighthouse SEO スコアが代表ページで 95+ 。
- Google Rich Results Test で各 JSON-LD タイプ(FAQPage / Question / LearningResource / BreadcrumbList / DefinedTerm / ItemList / WebSite + SearchAction)が検証を通過。
- (定量的な検索流入効果は実装後の継続計測。本仕様の範囲外)

### スコープ内
- `web/` 配下の全 SEO 関連変更
  - metadata、JSON-LD、OG 画像、sitemap、robots、内部リンク
  - 新規コンテンツページの追加
- 静的 SEO コンテンツ本文の生成(Claude Code セッション内で `.ts`/`.json` 静的ファイルとして起こす)
- 既存ページの本文を SEO 観点で深化
- 性能改善(LCP / CLS、画像最適化、フォント先行読込)
- E-E-A-T 強化(編集方針・運営体制・出典の明示)

### 非ゴール
- `pipeline/` リポジトリへの変更(API 追加・hints 再生成等は行わない)
- 外部リンク獲得(被リンク戦略は別タスク)
- 広告 / AdSense 配置の最適化
- 多言語対応(日本語のみで継続)
- 既存 UI / UX デザインの大刷新(SEO 要素追加に伴う最小限の変更のみ)

---

## 2. 全体アーキテクチャと Phase 構成

### 2.1 ディレクトリ構造の方針

注記: 以下のツリー中 `fe/` の配下に書かれた新規ファイル(`faq/`, `guide/`, `year/`, `category/`, `opengraph-image.tsx`)は、`ip/` と `takken/` 配下にも同じ構造で作成する。

宅建セクションには既存 URL 構造の差異が存在する(FE/IP: `/exam/[examId]` 単数 / 宅建: `/exams/[examId]` 複数、`/categories/[cat]` 複数)。既存 URL は SEO 観点で変更しない(リダイレクトコストを避ける)。本仕様で新設するパス(`/takken/faq`, `/takken/guide`, `/takken/year/[year]`, `/takken/category/[cat]`)は FE/IP と同じ単数形に揃える(タイポ防止と新ページ間の一貫性を優先)。

```
web/
├─ app/
│  ├─ opengraph-image.tsx                  # ルートOG (NEW)
│  ├─ fe/
│  │  ├─ opengraph-image.tsx               # /fe のOG (NEW)
│  │  ├─ faq/page.tsx                      # NEW
│  │  ├─ guide/page.tsx                    # NEW (試験概要・出題範囲・勉強法)
│  │  ├─ year/[year]/page.tsx              # NEW (年度別サマリー)
│  │  ├─ category/[cat]/page.tsx           # NEW (分野別サマリー — tagの上位概念)
│  │  ├─ exam/[examId]/opengraph-image.tsx # NEW (動的OG)
│  │  └─ play/[examId]/q/[qNumber]/opengraph-image.tsx # NEW
│  ├─ ip/   (faq, guide, year, category, opengraph-image を fe と同じ構造で)
│  ├─ takken/ (faq, guide, year, category, opengraph-image を追加。既存 exams/, categories/ は不変)
│  ├─ glossary/                            # NEW (全試験横断の用語集)
│  │  ├─ page.tsx                          # インデックス
│  │  └─ [term]/page.tsx                   # 用語詳細
│  ├─ methodology/page.tsx                 # NEW (E-E-A-T)
│  ├─ sources/page.tsx                     # NEW (E-E-A-T)
│  └─ sitemap.ts                           # 分割対応に書き直し (generateSitemaps)
├─ lib/
│  ├─ seo/                                 # NEW
│  │  ├─ og.ts                             # OG画像レンダリングヘルパー
│  │  ├─ metadata.ts                       # makeMetadata() 共通ジェネレータ
│  │  ├─ structured-data.ts                # JSON-LD ヘルパー集約
│  │  ├─ related.ts                        # 関連問題 / 関連タグ算出
│  │  ├─ glossary-matcher.ts               # 問題本文 → 用語抽出
│  │  ├─ year-summary.ts                   # 年度サマリーの集計ロジック
│  │  ├─ faq/{ip,fe,takken}.ts             # 手書きFAQ (このセッションで生成)
│  │  ├─ guide/{ip,fe,takken}.ts           # ガイド本文 (このセッションで生成)
│  │  └─ category-meta/{fe,ip,takken}.ts   # 大分類定義+説明文 (このセッションで生成)
│  └─ glossary-data.json (既存)            # 各 term に詳細解説 / 関連用語を追補
└─ components/
   └─ seo/                                 # NEW
      ├─ Breadcrumbs.tsx                   # 視覚パンくず + JSON-LD
      ├─ RelatedQuestions.tsx
      ├─ RelatedTags.tsx
      ├─ FaqAccordion.tsx                  # FAQPage JSON-LD 込み
      ├─ GlossaryInline.tsx                # 本文中の用語を辞書リンク化
      ├─ InternalLinkStrip.tsx             # ページ底部の "関連" 集約
      └─ JsonLd.tsx                        # script 出力の汎用ラッパー
```

### 2.2 Phase の独立性と依存関係

| Phase | 概要 | 依存 |
|---|---|---|
| Phase 1 | 技術 SEO 基礎(OG画像基盤、takken parity、sitemap 分割、robots見直し、共通ヘルパー) | なし |
| Phase 2 | 既存ページの深化(intro 拡充、関連 strip、Question/QAPage JSON-LD 拡張、FAQ snippet) | Phase 1 |
| Phase 3 | 新規 SEO ページ群(FAQ / 用語集 / 学習ガイド / 年度別 / 分野別) | Phase 1 |
| Phase 4 | 内部リンク graph 完成(全ページ底部の "関連" 群) | Phase 3 |
| Phase 5 | 性能 & E-E-A-T(LCP/CLS、画像最適化、author メタ、methodology / sources ページ) | なし |

- Phase 1 は最速マージ可能。
- Phase 2 と Phase 3 は並列実装可。
- Phase 4 は Phase 3 完了後に着手。
- Phase 5 はいつでも独立着手可。

### 2.3 コンテンツ生成のフロー

| コンテンツ種別 | 生成方法 | 保存先 |
|---|---|---|
| FAQ 本文 | Claude Code セッション内で生成 | `lib/seo/faq/{ip,fe,takken}.ts` |
| 学習ガイド本文 | Claude Code セッション内で生成 | `lib/seo/guide/{ip,fe,takken}.ts` |
| 用語集の解説強化 | Claude Code セッション内で生成 | `lib/glossary-data.json` 拡張 |
| 大分類(category)定義+説明 | Claude Code セッション内で生成 | `lib/seo/category-meta/{fe,ip,takken}.ts` |
| 年度別サマリー | ビルド時に既存 API(`listQuestions`, `getExamStats`)から集計 | 動的ページ |
| 関連問題 / 関連タグ | ビルド時に集計 | 動的計算 |
| 問題ページの intro | テンプレ + 既存 question データの組合せ | 動的計算 |

---

## 3. Phase 1 — 技術 SEO 基礎

### 3.1 OG 画像基盤

Next.js の `next/og` `ImageResponse` を使い、各ルートセグメントに `opengraph-image.tsx` を配置。動的ルートでは props から画像本文を生成。

表中の `app/[type]/...` 表記は `app/fe/...`, `app/ip/...`, `app/takken/...` の 3 ファイルを意味する(宅建は `exam/` ではなく `exams/`、`category/` ではなく `categories/` の既存パスを使う点に注意)。

| 配置場所 | 画像内容 |
|---|---|
| `app/opengraph-image.tsx` | 「合格.dev — 資格試験の過去問学習」+ ロゴ |
| `app/fe/opengraph-image.tsx` | 「基本情報技術者試験 過去問 + 解説」 |
| `app/ip/opengraph-image.tsx` | 「IT パスポート試験 過去問 + 解説」 |
| `app/takken/opengraph-image.tsx` | 「宅地建物取引士 過去問」 |
| `app/[type]/exam/[examId]/opengraph-image.tsx`(宅建は `exams/[examId]`) | 「{試験ラベル} {試験タイプ} 過去問 全{N}問」 |
| `app/[type]/play/[examId]/q/[qNumber]/opengraph-image.tsx`(宅建は `exams/[examId]/quiz/`) | 「問{N}」 + 試験ラベル + 問題本文先頭 60 文字 |
| `app/[type]/tag/[tag]/opengraph-image.tsx`(宅建は新規) | 「#{タグ}」 + 試験タイプ |
| `app/glossary/[term]/opengraph-image.tsx` | 「{用語}」 + 説明 1 行 |

- 共通レイアウト / フォント / 色を `lib/seo/og.ts` の `renderOgImage(title, subtitle, badge)` に集約。
- `size = { width: 1200, height: 630 }`、`contentType = 'image/png'`。
- OG 画像ファイルがあれば Next.js が自動で `og:image` / `twitter:image` メタタグを `metadataBase` 解決した絶対 URL で出力する。

### 3.2 宅建セクションを FE / IP と同じ SEO 構造に

現状: `app/takken/page.tsx` などは `metadataBase` 不在 / canonical 一部のみ / JSON-LD なし / breadcrumb なし。FE / IP と同じパターンに統一する。

対象ファイル:
- `app/takken/page.tsx` — canonical, OG, Twitter, WebPage JSON-LD
- `app/takken/exams/page.tsx` — canonical, ItemList JSON-LD
- `app/takken/exams/[examId]/page.tsx` — `generateMetadata`, LearningResource JSON-LD, Breadcrumb
- `app/takken/exams/[examId]/quiz/page.tsx` — Question / QAPage JSON-LD
- `app/takken/categories/page.tsx` + `[cat]/page.tsx` + `[cat]/quiz/page.tsx` — 同上
- `app/takken/search/page.tsx` — `noindex` (検索結果ページ)

宅建固有の意匠(mincho / charcoal トーン)は維持し、SEO 要素は既存のスタイルに合わせる。

### 3.3 sitemap の再設計

現状の `app/sitemap.ts` は問題ページを全てフラットに 1 ファイルで出力。takken + 新規ページが加わると Google の sitemap 上限(50,000 URL / 50 MB)に近づき、ビルド時間も嵩む。

`generateSitemaps` で分割:

| sitemap | 内容 |
|---|---|
| `sitemap/0` | ルート + 試験トップ + about / privacy / terms / contact / support / glossary index / methodology / sources / 各 type の faq / guide |
| `sitemap/1` | FE 全 URL (exam, question, tag, year, category) |
| `sitemap/2` | IP 全 URL |
| `sitemap/3` | 宅建 全 URL |
| `sitemap/4` | Glossary term 詳細 |

各 sitemap で必要な API データのみ取得する。

### 3.4 robots.ts 見直し

既存 disallow リストは概ね妥当だが以下を変更:

追加:
- `/takken/bookmarks`, `/takken/wrong`, `/takken/stats`, `/takken/search`

削除:
- `/play/random` (`next.config.ts` redirect で `/fe/play/random` に 301 されており、新 URL は既に disallow 済 — 重複削除)

### 3.5 metadata 共通ヘルパー

`lib/seo/metadata.ts` を作り、

```ts
makeMetadata({
  title: string,
  description: string,
  path: string,           // 例: "/fe/exam/2023h-sp-01"
  type?: "website" | "article",
  ogImagePath?: string,   // 省略時はNext.jsが自動解決
}): Metadata
```

を提供。各ページの `generateMetadata` を簡潔化する。

### 3.6 共通 Breadcrumb コンポーネント

`components/seo/Breadcrumbs.tsx` を作成。視覚的なパンくず + Breadcrumb JSON-LD を 1 コンポーネントで両方出力。全コンテンツページに配置。

### 3.7 Phase 1 完了の検証

- 全ページに `og:image`(画像 URL 付き)・canonical・breadcrumb が出力されているか手動 + 自動テスト。
- 宅建ページが FE / IP と同等の JSON-LD を出すか snapshot test。
- sitemap が全 URL(takken 含む)を正しく出力するか integration test。
- Google Rich Results Test で代表ページが構造化データ検証を通過。

---

## 4. Phase 2 — 既存ページの深化

### 4.1 問題ページ(`/[type]/play/[examId]/q/[qNumber]`)

追加:
- **H1 配置**: `問{N}: {本文先頭 60 文字}…` を `<h1>`(視覚的には sr-only も可)で必ず出力。
- **解説サマリーの先出し**: `<details>` + `<summary>`(初期 `closed`)で server-rendered。クロール対象には載るが視覚的なネタバレなし。
- **正答ラベル・正答率を JSON-LD に反映**: 既存 Question JSON-LD の `acceptedAnswer.text` に加え、`educationalAlignment` や `interactionStatistic` を追加。
- **関連問題 strip**: 同タグ問題 3〜5 件 + 同年度の前後問題 2 件を `<aside>` で server-rendered。
- **本問題に登場する用語のリンク化**: `lib/seo/glossary-matcher.ts` で本文を走査し、ヒットした用語を `/glossary/[term]` へリンク。
- **QAPage 構造化データ**: 既存 Question を `@type: "QAPage"` の `mainEntity` として包む。Google の QAPage はコミュニティ Q&A 向けの想定だが、過去問の「1 質問+正答+選択肢」構造でも Rich Results Test を通過するかを実装時に検証する。通過しなければ Question + LearningResource の組合せに留める(Phase 2 着手チェック項目)。

### 4.2 試験詳細ページ(`/[type]/exam/[examId]`)

現状ボタン 3 つだけの典型的 thin content。

追加:
- **試験紹介文 200〜400 字**(programmatic: exam meta + テンプレ)
- **出題分野の内訳ミニ表**: タグ別問題数を `listQuestions` から集計 → 上位 5 タグを表示しタグページへリンク。
- **収録問題リスト全件**: q1〜qN を順番に並べた表でクロール導線を厚くする。
- **このexam 用 FAQ snippet 3〜5 問**: `lib/seo/faq/{type}.ts` から「合格点は」「難易度は」等を抽出して表示 + FAQPage JSON-LD。
- **前後年度ナビ**: 過去 / 次の試験回へのリンク。
- **LearningResource JSON-LD 拡張**: `hasPart` に問題リスト、`teaches` にタグ群、`timeRequired` に推奨学習時間。

### 4.3 タグページ(`/fe/tag/[tag]` + IP / takken 新設)

追加:
- **タグ紹介文 100〜250 字**: `lib/seo/category-meta/` から該当タグの説明を引き、無ければ programmatic テンプレ。
- **関連タグ**(同一問題に同居する頻度の高いタグ上位 5 件)→ 関連タグページへリンク。
- **収録試験年度リスト**(このタグの問題がある年度)→ 試験詳細へリンク。
- **IP / 宅建にも `/{type}/tag/[tag]` を新設**(FE と同じパターン)。
- **CollectionPage JSON-LD**: `mainEntity` に問題リストを ItemList で。

### 4.4 ホームページ(`/`, `/fe`, `/ip`, `/takken`)

追加(各試験ホーム):
- **試験概要 200 字前後の intro**(現状 description のみ)
- **「最新年度に挑戦」「分野別に挑戦」「FAQ」「用語集」「学習ガイド」の導線セクション**
- **WebSite JSON-LD に `potentialAction: SearchAction` 追加**(サイトリンク検索ボックス対応)
- **ItemList JSON-LD で試験一覧を構造化**

### 4.5 共通: パン屑強化

`components/seo/Breadcrumbs.tsx`(Phase 1 で作成)を全コンテンツページ最上部に配置。
例(問題ページ): `合格.dev > 基本情報技術者試験 > 令和5年春 > 問42`

### 4.6 Phase 2 の検証

- 各ページの本文文字数が 300 字以上になっているか lint script。
- Question / QAPage / FAQPage / CollectionPage JSON-LD が Rich Results Test を通過。
- 関連問題 strip が壊れない / 無限ループしないことのユニットテスト。

---

## 5. Phase 3 — 新規 SEO ページ群

### 5.1 FAQ ページ `/{type}/faq`

試験ごとに 15〜25 問の FAQ。FAQPage JSON-LD 必須。トピック例:
- 試験概要(難易度・合格点・合格率・受験料・時間・形式)
- 申込み方法・受験資格・試験会場
- 出題傾向・科目別配点・直近改定
- 過去問の活用方法・推奨学習時間・学習順序
- 当サイトの使い方(模試モード・ブックマーク・履歴)

本文は本セッションで `lib/seo/faq/{ip,fe,takken}.ts` として全項目を起こす(各 300〜600 字)。

### 5.2 用語集 `/glossary` + `/glossary/[term]`

- インデックスページ: 全用語をかな順 / 分野フィルタ / 検索ボックス付き一覧。
- 用語詳細: 「定義」「詳しい解説」「関連用語」「この用語が登場する過去問リスト」をセクション化。
- `DefinedTerm` JSON-LD + Article JSON-LD。
- 既存 `glossary-data.json` のエントリを本セッションで「定義 1 行」→「詳細解説 300〜500 字 + 具体例」に増補。

### 5.3 学習ガイド `/{type}/guide`

1 ページ完結の長文ガイド(目安 3,000〜5,000 字)。構成:
- 試験概要
- 受験資格・申込み
- 出題範囲(分野別配点と推奨学習比率)
- 合格基準と難易度推移(過去数年の合格率データ表 — `lib/pass-rates` 活用)
- 標準学習スケジュール(初心者 / 3 ヶ月 / 1 ヶ月直前)
- 分野別 攻略のコツ
- 当サイトの使い方
- よくある質問へのリンク

本文は本セッションで起こし、`lib/seo/guide/{ip,fe,takken}.ts` に章ごとのデータ構造(`{ id: string, heading: string, body: string }[]`)で保持。`id` は分野サマリーや FAQ から個別章へアンカーリンク `/{type}/guide#{id}` を貼るための識別子。ページ側は章を MDX 風レンダリング。

### 5.4 年度別サマリー `/{type}/year/[year]`

URL の `[year]` スラッグは **西暦 4 桁(例: `2023`)を一次キーとし、必要に応じて時期サフィックスを付ける**(春期は `-h`、秋期は `-a`、例: `/fe/year/2023-h`)。FE / IP のように年 2 回実施される試験では `2023` がインデックス兼ナビゲーションページ(2023 年の春・秋を両方リスト)、`2023-h` / `2023-a` が個別の試験回サマリーになる。宅建は年 1 回のため `/takken/year/2023` のみ。

元号での検索(令和 5 年など)は H1 / description / 本文に元号併記でカバーする(URL を別途切らない)。

各ページの内容(完全 programmatic、`listExams` から該当年度の試験回を抽出):
- 試験回ごとの問題数・収録状況
- 出題分野の比率(タグから集計)
- 合格率(`lib/pass-rates`)
- 全問題リストへのリンク
- 同年度の他試験(春 / 秋)へのリンク
- 前後年度へのナビ

### 5.5 分野別サマリー `/{type}/category/[cat]`

タグより 1 段上の「大分類」。
- FE / IP: 「ストラテジ系 / マネジメント系 / テクノロジ系」
- 宅建: 「権利関係 / 法令上の制限 / 宅建業法 / 税その他」

`lib/seo/category-meta/{type}.ts`:

```ts
{
  slug: "technology",
  name: "テクノロジ系",
  description: "...500字...",
  tags: ["#ハードウェア", "#ネットワーク", ...],
  studyTips: "...",
}
```

ページ構成: 概要 → 含まれるタグ一覧 → このカテゴリの問題数 → 代表問題 10 件 → 学習のコツ → 関連年度サマリーへのリンク。

### 5.6 IP / 宅建のタグページ新設 `/{type}/tag/[tag]`

実装方針:
1. 既存 `app/fe/tag/[tag]/page.tsx` を読み、データ取得部(`listExams` / `listQuestions`)と表示部を分離。
2. データ取得部を `lib/seo/tag-page.ts` にメソッド化(`type` 引数で `listExams|listIpExams|TakkenAPI.listExams` を切り替え)。
3. 表示部は `components/tag/TagPageView.tsx` などの共通コンポーネントに抽出(既存 `TagQuestionRow` を再利用)。
4. `app/ip/tag/[tag]/page.tsx`, `app/takken/tag/[tag]/page.tsx` を新設し、共通実装に type を渡すだけにする。
5. `tagToSlug` / `slugToTag`(既存 `lib/tag-url.ts`)はそのまま使用。

宅建のタグデータソースは `TakkenAPI` が `popularTags` 相当を返すかを実装時に確認し、無ければ `TakkenAPI.listQuestions` を全件走査して集計する(問題数 ~1,300 程度なのでビルド時許容範囲)。

---

## 6. Phase 4 — 内部リンク graph 完成

全ページの **底部に 2〜4 つの "関連" セクション** を server-rendered で必ず配置。クロール導線を厚くし、滞在ページ間の遷移率を上げ、PageRank を相互伝播。

| ページ種別 | 表示する関連リンク |
|---|---|
| 問題ページ | 関連問題(同タグ 5 件)/ 同年度の前後問題 / この問題に登場する用語 / この問題が属する分野 |
| 試験詳細 | 同年度の他試験回 / 前後年度試験 / 主要タグ上位 5 件 / 学習ガイド / FAQ |
| タグページ | 関連タグ 5 件 / 該当する分野 / 該当タグの問題が多い年度の試験詳細 |
| 年度サマリー | 前後年度 / 同年度の試験回 / 主要タグ / 分野サマリー |
| 分野サマリー | 含まれるタグ全件 / 代表年度 / 学習ガイドの該当章へのアンカーリンク |
| FAQ | 学習ガイド / 関連 FAQ 項目(タグ別) |
| 用語詳細 | 関連用語(同分野)/ 登場する過去問 / 関連分野 |
| 学習ガイド | FAQ / 全分野サマリー / 全年度サマリー(年表) |

`lib/seo/related.ts` に全関連算出ロジックを集約する。重み付け:
- 同タグ重み
- 年度近接重み
- 分野重み
- 難易度重み

---

## 7. Phase 5 — 性能 & E-E-A-T

### 7.1 Core Web Vitals

- `<img>` 直書きを `next/image` に置換(`app/page.tsx` の AppStore / Google Play バッジ等)。
- ストアバッジ画像はリモートのまま、`next.config.ts` の `images.remotePatterns` で許可。`priority` は付けない。
- script フォントを `next/font/local` で self-host・preload・`font-display: swap`。
- KaTeX CSS を critical CSS で先行配信(問題ページの数式 CLS 対策)。
- `app/layout.tsx` のテーマ初期化 inline script は維持(FOUC 対策、SEO 影響なし)。
- AdSense script は `strategy="lazyOnload"` に格下げ(LCP 影響を回避)。

### 7.2 メタデータ完成度

- 全ページで `description` を 80〜160 字、検索クエリを含めた形で最適化(`keywords` は使わない)。
- `viewport` メタタグは Next 16 デフォルトを利用。
- `lang="ja"` 確認済。

### 7.3 E-E-A-T 強化

- `/about` を編集方針・運営体制・問題収録方針・解説作成プロセスまで踏み込んだ内容に大幅増補(2,000 字目標)。
- `/methodology` 新設: 「解説生成プロセス」「品質保証フロー」「過去問の出典」「正答率データの算出方法」を独立ページ化。
- `/sources` 新設: 出典(IPA / 不動産適正取引推進機構など)の根拠と引用範囲を明記。
- 全問題ページに `dateModified` / `datePublished` を JSON-LD に追加(`datePublished` は試験回の実施年月から導出、`dateModified` は本サイト側のデータ最終更新日。`pipeline/` の API に該当フィールドが無ければ Phase 5 着手前に確認し、無ければ `datePublished` のみで運用する。Phase 5 着手チェック項目)。
- Organization JSON-LD に `logo` / `sameAs`(App Store URL 等)/ `contactPoint` を追加。
- 各記事系ページ(FAQ / Guide / Glossary)に `author: { "@type": "Organization", name: "合格.dev" }` を付与。

---

## 8. 横断事項

### 8.1 テスト戦略

- **Vitest unit**: metadata generator / JSON-LD shape / 関連算出ロジック / glossary matcher。
- **Vitest integration**: `sitemap.ts` の全 URL 生成 / robots 出力。
- **Snapshot**: 各ページの JSON-LD 出力。
- **手動検証**: Google Rich Results Test(代表ページ各種別 1 件)/ Lighthouse SEO 95+。
- **回帰防止**: 既存 vitest スイートを壊さない。

### 8.2 ビルド時間の管理

新規ページ(年度・分野・FAQ・ガイド・用語) + 全試験の OG 画像で URL 数と画像生成が急増する。対策:
- sitemap は `generateSitemaps` で 5 本に分割。
- OG 画像は静的に近いものは `revalidate` を長め(1 日〜7 日)に設定。
- ビルド時 fetch は `Promise.all` + `lib/api-client.ts` の revalidate を活用(既存通り)。
- 問題ページの個別 OG 画像はビルド時生成ではなく **ISR(オンデマンド生成)** を採用。

### 8.3 コンテンツ生成プロセス(本セッションでの作業)

本セッションで生成する静的コンテンツ(分量目安):
- FAQ × 3 試験 × 15〜25 問(計 45〜75 項目)
- 学習ガイド × 3 試験 × 8 章(計 24 章)
- 用語集の解説増補 × 既存 `glossary-data.json` の全エントリ(現時点での件数は実装着手時に確認)
- 分野メタ × 3 試験 × 各 3〜4 カテゴリ(計 9〜12 カテゴリ)
- `about` / `methodology` / `sources` の本文(各 1,000〜2,000 字)

→ 量が多いので Phase 3 実装時に `subagent-driven-development` で「FAQ 生成」「ガイド生成」「用語増補」を並列ディスパッチ可能(各サブエージェントに該当ファイルだけ書かせる)。

### 8.4 リダイレクト / canonical 整合

既存 `next.config.ts` の旧 URL → 新 URL リダイレクトは維持。canonical は常に新 URL 側を指す(既存実装通り)。
新規ページ追加に伴う旧 URL は発生しないので追加リダイレクトは不要。

---

## 9. リスク・緩和策

| リスク | 影響 | 緩和策 |
|---|---|---|
| AI 生成コンテンツの品質が低く Google の「自動生成」ペナルティ | 致命 | Claude Code が起こした本文は実装時に必ずユーザーがレビュー。事実関係は公式情報照合。テンプレ的な大量増殖は避ける |
| ビルド時間 / Vercel ビルド timeout | 高 | sitemap 分割、OG ISR、`generateStaticParams` で頻出のみ事前生成 |
| 既存ページの大幅変更で内部リンク切れ | 中 | URL は追加のみで既存変更なし。リダイレクトは維持 |
| sitemap 50,000 URL 上限到達 | 中 | 分割で対応。試算: FE(~1,000) + IP(~3,000) + 宅建(~1,300) + tag(~100×3) + year(~30×3) + category(~4×3) + glossary(~500) ≈ 6,000 URL。十分余裕あり |
| thin content 判定(短いカテゴリページ等) | 中 | 各ページ最低 300 字の本文 + 関連リンクで補強 |
| 既存テスト破壊 | 中 | metadata 変更は generator 化して unit テストで担保 |
| OG 画像生成での Edge Runtime 制限 | 低 | `next/og` は Node Runtime でも動作可。フォント埋め込みで対応 |
| 宅建の UI デザイン崩し | 中 | 宅建固有の mincho / charcoal トーンは維持し、SEO 要素は既存スタイルに合わせる |

---

## 10. 用語

- **試験タイプ(type)**: `fe` / `ip` / `takken`(URL セグメントとも一致)。
- **試験回(exam)**: 1 回分の試験(例: 令和 5 年春期 基本情報技術者試験 午前)。`exam_id` で一意。
- **タグ**: 既存の細かい分類(例: `#ハードウェア`、`#TCP/IP`)。
- **大分類(category)**: 本仕様で導入する上位カテゴリ(例: 「テクノロジ系」)。tag より粗い。
- **問題(question)**: 1 問。`q_number` と `exam_id` で一意。
- **type 抽象化**: FE 既存実装を `fe` / `ip` / `takken` 共通の helper に抽出すること。

---

## 11. 実装後の運用メモ

- Google Search Console で sitemap を 5 本とも登録する。
- Rich Results Test を全 JSON-LD タイプで 1 件ずつ初回検証。
- Vercel Speed Insights / Lighthouse CI を CI に組み込む(Phase 5 で検討)。
- 定期的に低 CTR / 低 impression ページを Search Console で抽出して description / title 改善のループを回す(本仕様外、運用継続課題)。
