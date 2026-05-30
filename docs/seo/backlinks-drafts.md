# 外部被リンク獲得ドラフト集

新ドメイン goukaku.dev の被リンク 0 状態を解消するため、コピペで使えるドラフトをまとめます。
公開は手作業 (X / Qiita / Wikipedia 等のアカウントから)。

---

## 1. X (旧 Twitter) 投稿テンプレート

### 1-A. 宅建向け (受験生コミュニティ狙い)

> 宅建の過去問を H16〜R7 まで全部、無料で解説付きで公開しました。会員登録ナシ・広告控えめ・スマホ最適化。
> 各設問は「全体解説 + 選択肢ごとの解説」の二段構えで、なぜ正解か / 他がなぜ違うかを言語化してあります。
> https://goukaku.dev/takken
> #宅建 #宅建士 #過去問 #宅建試験

### 1-B. 基本情報技術者試験向け

> 基本情報技術者試験 (FE) 科目A の過去問 800 問超、解説付きで無料公開。
> 順番 / ランダム / 模試 90 分の 3 モード。図表は SVG で再描画してあり Retina でも滲みません。
> https://goukaku.dev/fe
> #基本情報技術者試験 #FE #過去問 #ITエンジニア

### 1-C. ITパスポート向け

> ITパスポート試験 (IP) 29 年分・全 2,900 問の過去問を解説付きで無料公開。
> 3 分野 (ストラテジ / マネジメント / テクノロジ) 別の学習に対応。
> https://goukaku.dev/ip
> #ITパスポート #iパス #過去問

### 1-D. 開発者向け (Next.js 16 + Tailwind v4 スタック)

> 過去問学習サイトを Next.js 16 (App Router) + React 19 + Tailwind v4 + Vercel で個人開発しています。
> 試験データは Cloudflare R2 + MongoDB で配信、iOS アプリは SwiftUI。
> 通勤通学のスキマ学習用に作りました。
> https://goukaku.dev

---

## 2. Qiita 記事ドラフト (1 本)

**タイトル案**: 「個人開発で資格試験の過去問サイトを作った話 (Next.js 16 + Tailwind v4)」

**本文骨子** (Markdown で投稿):

```markdown
# 個人開発で資格試験の過去問サイトを作った話

通勤時間の学習用に [合格.dev (https://goukaku.dev)](https://goukaku.dev) という資格試験の過去問学習サイトを作りました。
基本情報技術者試験 / ITパスポート / 宅地建物取引士に対応していて、全部無料・会員登録不要です。

## 動機

- 既存の過去問サイトは広告が多く、スマホでの操作性が悪い
- 解説の質にばらつきがあり、「なぜそれが正解か」が言語化されていない
- 模試モード / 分野別 / 年度別 を 1 つのサイトで切り替えたい

## 技術スタック

- フロント: Next.js 16 (App Router) + React 19 + Tailwind v4
- ホスティング: Vercel
- API: Hono on Node 26 + MongoDB Atlas
- 図表配信: Cloudflare R2 + SVG 化
- iOS: SwiftUI (3 試験分でアプリ別配信)

## 工夫した点

### 1. 解説は「全体解説 + 選択肢別解説」の二段構え
四肢択一の引っかけパターンに弱い受験生のために、「なぜ正解」だけでなく「他の 3 つがなぜ違うか」を 1 つずつ言語化。

### 2. 図表は PDF からベクター化
公式 PDF 内の図表は SVG で再描画。Retina ディスプレイでも文字が滲まず、画像最適化も不要。

### 3. 宅建では条文・判例ポップアップ
問題文中の「民法 644 条の 2」などをタップすると本文がオーバーレイ表示。別タブで六法を開く必要なし。

## 今後

他の国家資格 (簿記 / 行政書士 / 危険物乙四 等) にも順次対応予定です。
リクエストは [サイトのお問い合わせ (https://goukaku.dev/contact)](https://goukaku.dev/contact) から。

---

ソースは個人リポジトリで管理中。ご意見・バグ報告歓迎です。
```

**タグ**: `Next.js`, `React`, `TypeScript`, `個人開発`, `資格試験`

---

## 3. Zenn 記事案 (Qiita の代替)

同内容を Zenn に投稿する場合、コードベースをスクラップ風に分割:

- スクラップ 1: 「Next.js 16 で過去問サイトのルーティング設計」
- スクラップ 2: 「Cloudflare R2 + Hono で軽量 API ホスティング」
- スクラップ 3: 「Tailwind v4 の `@theme` で試験別テーマ管理」

各スクラップから https://goukaku.dev に内部リンク。

---

## 4. Wikipedia / Wikidata

**Wikipedia 「宅地建物取引士」記事の「関連リンク」追加候補**:

```
== 外部リンク ==
* [https://goukaku.dev/takken 合格.dev 宅建過去問] - H16〜R7 までの過去問演習サイト (無料・解説付き)
```

※ Wikipedia の外部リンク追加は WP:EL ガイドラインに沿うこと。商用色が強いと revert されるので、教育目的を明確に。

**Wikidata エントリ作成**:
- Item: 合格.dev (Q?)
- Instance of: Q35127 (website)
- Official website: https://goukaku.dev
- Country: Japan
- Language: 日本語

---

## 5. GitHub README リンク

新組織 `goukakudev` への rename 完了済み (2026-05-30)。各リポジトリ README 冒頭に:

```markdown
# web

> [合格.dev (https://goukaku.dev)](https://goukaku.dev) の Web フロントエンド (Next.js 16 + Tailwind v4)。

[![Open in goukaku.dev](https://img.shields.io/badge/Open-goukaku.dev-pink)](https://goukaku.dev)
```

GitHub の OSS リポジトリからの外部リンクは Google にとって質の高い被リンクとして扱われやすい。

---

## 6. 国内開発者向けディレクトリ

| サイト | 種別 | 提出方法 |
|---|---|---|
| [Product Hunt](https://www.producthunt.com/) | 製品掲載 | 英語タイトルで提出 |
| [BetaList](https://betalist.com/) | 個人開発製品 | 英語 OK |
| [Tools of Japan](https://toolsofjapan.com/) | 国内ツール集 | 日本語掲載 |
| [Awesome 日本語学習](https://github.com/topics/japanese-learning) | GitHub topic | リポジトリ公開後 |
| [Qiita Trend / 個人開発](https://qiita.com/tags/個人開発) | タグ付け | 記事内で URL 言及 |

---

## 7. 受験生コミュニティへの直接告知 (ガイドライン遵守)

| コミュニティ | 場所 | 注意点 |
|---|---|---|
| 宅建みやざき塾 公式 LINE オープンチャット | LINE | 宣伝禁止ルールあり、運営に許可取り |
| 過去問道場 掲示板 | Web | 単純な URL 投下は禁止 |
| 5ch 資格全般板 | Web | スレタイ準拠で言及 |
| Reddit r/japan, r/LearnJapanese | Reddit | 英語で簡潔に |

※ コミュニティガイドライン違反は逆効果。「告知」ではなく「学習法を共有する文脈で URL を含める」のが鉄則。

---

## 8. ローカルメディア / ブログ寄稿

長文 SEO 用の他媒体への寄稿候補:

- note.com 個人ブログ「資格試験を独学で受かるための過去問サイト 3 選」
- はてなブログ「宅建独学 体験記」シリーズ内での言及
- マイベスト / ZENB 系の比較記事に売り込み

---

## 優先順位 (効果 vs 工数)

| 施策 | 効果 | 工数 | 推奨度 |
|---|---|---|---|
| Qiita 1 記事投稿 | 高 (DR 80 サイトからの dofollow) | 1 時間 | ★★★ |
| X 投稿 4 種 | 中 | 30 分 | ★★★ |
| GitHub README リンク | 中 | 10 分 | ★★ (rename 後) |
| Wikipedia 外部リンク追加 | 高 | 30 分 (revert リスクあり) | ★★ |
| Reddit / 海外コミュ | 低〜中 | 30 分 | ★ |
| ディレクトリ提出 | 低 | 1 時間 | ★ |

---

## 注意

- **スパム判定回避**: 短期間に大量のリンクが付くと逆効果。1〜2 週間で 5〜10 件のペースが安全
- **アンカーテキストの多様性**: 「合格.dev」「goukaku.dev」「宅建過去問サイト」など 3〜5 種類を混ぜる。同じアンカーばかりだと不自然
- **nofollow / dofollow**: Qiita / Zenn は dofollow、X / Reddit は nofollow が多い。それでも被リンク多様性として価値あり
