# goukaku.dev

資格学習サイト [goukaku.dev](https://goukaku.dev/) の Next.js アプリです。App Router、React、Tailwind v4 を使用し、公開アプリは Cloudflare Containers 上の standalone Node.js サーバーで動作します。ソースは [goukakudev/web](https://github.com/goukakudev/web)、通常の公開対象は `main` です。

## 現在の公開構成

2026-10-10 の読み取り確認で、次の構成が有効でした。

| 役割 | 構成 |
| --- | --- |
| Web | Worker `goukaku-web` → `NEXT_CONTAINER` → Next.js standalone、port 8080 |
| Web の route | `goukaku.dev/*`、`www.goukaku.dev/*` |
| Container application | `goukaku-web-nextcontainer` |
| API | Worker `goukaku-api`、`api.goukaku.dev/*`、追加ドメイン `api-next.goukaku.dev` |
| 学習データ | API の D1: `goukaku-fe`、`goukaku-ip`、`goukaku-ap`、`goukaku-sg`、`goukaku-sc`、`goukaku-dk`、`goukaku-kn`、`goukaku-tk` |
| 問題の図版 | R2 の `r2.goukaku.dev`。Web Worker の hostname guard はこれをアプリへ転送しない |
| 公開方法 | `.github/workflows/deploy.yml` の手動実行 (`workflow_dispatch`) |

Cloudflare Pages と Vercel は現在の公開先ではありません。`wrangler.jsonc` と workflow に残っている「dormant fallback」「EC2本番」のコメントは過去構成を示します。現在の apex / www Workers Route は既に存在し、ダッシュボードで管理されています。Web刷新のために再作成・変更する必要はありません。

`worker.ts` は通常のHTML GETを短時間キャッシュし、RSC・API・ランダム出題などを直接アプリへ渡します。学習履歴の localStorage、問題・解説・図版、API認証、既存URLとリダイレクトを保ったままUIを変更してください。

## ローカル開発と検証

この環境の配置は `/Users/johnny/projects/foxode/goukaku-web` です。Node.js 22 と `package-lock.json` を使います。コード変更前に `AGENTS.md` と、インストールされた `node_modules/next/dist/docs/` の該当ガイドを確認します。

```sh
cd /Users/johnny/projects/foxode/goukaku-web
export PATH="/Users/johnny/.nvm/versions/node/v22.13.1/bin:$PATH"
npm ci
npm test
npm run typecheck
npm run lint
```

開発サーバーは `npm run dev`、ビルドは `npm run build` です。ビルド中の静的ページ生成でもAPIを参照するため、有効な `API_BASE` と `API_KEY` が必要です。環境変数の名前は `.env.local.example` にあります。値は安全な既存の管理経路から設定し、`.env.local` や `.dev.vars` をコミットしません。今回の作業では既存の秘密値を表示・抽出しません。

ローカルにビルド用の秘密情報がない場合、テスト等を実施したうえで、既存 GitHub Actions の Docker build 内で `npm run build` が成功することを公開条件とします。ローカルで実行していないビルドを成功したと報告しないでください。ロックファイルの依存を勝手に更新してビルドを通す運用はしません。

`next.config.ts` は通常 `output: "standalone"` です。配信には Dockerfile の `node server.js` を使用します。`npm start` の `next start` を standalone 本番の起動コマンドに置き換えないでください。

## GitHub Actions で公開

必要な Repository Secret は次の4つです。2026-10-10 に名前の存在を確認済みで、値は表示していません。

| Secret | 用途 |
| --- | --- |
| `API_BASE` | ビルド時に参照するAPIの接続先 |
| `API_KEY` | ビルド時とアプリ実行時のAPI認証 |
| `REVALIDATE_TOKEN` | アプリの再検証用認証 |
| `CLOUDFLARE_API_TOKEN` | Registry・Workerへの公開 |

GitHub Actions の secret と Worker の runtime secret は別管理です。既存 workflow は BuildKit secret でイメージをビルドし、公開後に Worker の `API_KEY` と `REVALIDATE_TOKEN` を同期します。`API_BASE` は Worker の変数として `wrangler.jsonc` にあります。秘密値をビルド引数、`NEXT_PUBLIC_*`、HTML、ログへ出さないでください。

1. 作業木と差分を確認し、対象変更だけをコミットして公開対象の ref に push します。事前に現在の commit・Worker version・container image を記録します。
2. 対象 ref の workflow を手動実行します。`main` への push だけでは公開されません。
3. 実行の `headSha` が意図したコミットであることと、build / deploy の完了を確認します。

```sh
gh workflow run deploy.yml --repo goukakudev/web --ref main
gh run list --repo goukakudev/web --workflow deploy.yml --event workflow_dispatch --limit 5 --json databaseId,headSha,status,conclusion
gh run watch RUN_ID --repo goukakudev/web --exit-status
```

workflow は linux/amd64 イメージを作り、`goukaku-web:<commit SHA>` として Cloudflare Registry へ送信します。そのSHAを一時的に `wrangler.jsonc` の image に設定して公開するため、更新時には異なる image URL が使用されます。`goukaku-web:ci` は置換用のプレースホルダーで、直接公開するタグではありません。[GitHubの手動実行](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)

既存ローカル OAuth で公開状況を確認できます。トークンを出力・引数へコピーする必要はありません。

```sh
npx wrangler deployments list --name goukaku-web
npx wrangler containers list
curl --head https://goukaku.dev/
```

Worker公開とContainer置換は一括トランザクションではありません。workflow成功後にも新しいimage tag、公開HTTP応答、変更した画面や機能を確認します。検証にはそのセッションで許可された方法だけを使ってください。`goukaku-api` とD1にはWeb公開に伴う変更やマイグレーションを行いません。[Cloudflareの公開とロールアウト](https://developers.cloudflare.com/containers/guides/deploy/)

## 切り戻し

刷新前の確認済み基準点（2026-10-10、最終更新 2026-08-02）:

| 対象 | 値 |
| --- | --- |
| Source commit | `3034db5f36f54c44a59fb1b1d53ae3e50d5e60d3` |
| Worker version | `5b14e977-921b-4712-b79f-54fb98b8458a` |
| Worker deployment | `a405ae3b-21b2-42dc-90e2-d22662e1e7a2`、100% |
| Container image | `registry.cloudflare.com/76f707f5e922704134eb4dee65d05e45/goukaku-web:3034db5f36f5` |

アプリ全体を戻す場合は、直前の正常な commit を指す既存の branch/tag で同じ workflow を実行します。必要なら専用の復旧タグを作成して push します。次は上記の基準点に戻す例で、通常の公開時には実行しません。

```sh
git tag rollback/goukaku-20260802 3034db5f36f54c44a59fb1b1d53ae3e50d5e60d3
git push origin refs/tags/rollback/goukaku-20260802
gh workflow run deploy.yml --repo goukakudev/web --ref rollback/goukaku-20260802
```

タグが既にある場合は参照先を確認して再利用し、強制的に上書きしません。`--ref` は branch/tag を指定します。復旧後も Worker version・container image・公開結果を確認してください。

Workerコードだけを以前の版へ戻す緊急操作は次のとおりです。

```sh
npx wrangler rollback 5b14e977-921b-4712-b79f-54fb98b8458a --name goukaku-web --message "Restore pre-refresh Worker version"
```

これはWorkerのバージョン切り戻しです。外部リソースは巻き戻らないため、Containerのアプリも戻ったと判断せず、imageと実配信を確認します。UIの復旧には既知commitからのアプリ再公開を優先します。正常な旧イメージは新しい公開結果を検証するまで削除しません。[Worker rollbackの範囲](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)、[Container imageの保持](https://developers.cloudflare.com/containers/guides/image-management/)

## 過去のEC2構成

以前は AWS 大阪 `GO-WEB`（`i-0902c68e9d7a1e6bc`、EIP `15.168.222.228`、profile `go`）に配置し、Caddy → `goukaku-web.service` → standalone server（port 3000）で配信していました。配置先は `/opt/goukaku-web`、環境設定は同ディレクトリの `.env.local` です。これは過去の復旧資料で、現在の通常公開手順では使用しません。

2026-10-10 の読み取り調査ではこのEC2へのSSHはタイムアウトし、AWS profile `go` は認証エラーでした。再利用する場合はインスタンス・認証・route・TLSを改めて確認します。以前障害の原因となった `api.goukaku.dev` をprivate IPへ固定する `/etc/hosts` 設定は復活させません。既存Cloudflare本番からEC2への切替は今回の刷新に含めません。
