# GitHub Support 申請: goukaku-dev 組織名の解放依頼

## 提出先
https://support.github.com/contact

カテゴリ: **「Account」** → **「Username and account changes」**

## 件名 (Subject)
```
Request to release reserved organization name "goukaku-dev" for legitimate domain owner
```

## 本文 (英語版・推奨)

```
Hello GitHub Support,

I am requesting the release of the organization name "goukaku-dev"
which is currently held in the post-deletion cooling-off period.

CONTEXT:
- I am the previous owner of the "goukaku-dev" organization on GitHub.
- I deleted the organization on approximately 2026-05-24 to restructure my
  account hierarchy, intending to rename my other organization to
  "goukaku-dev". I did not realize the 90-day reservation policy
  would apply since the deletion was my own action.
- All repositories that were previously under "goukaku-dev" are still
  under my control, transferred to "kanjiquizgakkou-prog":
    - kanjiquizgakkou-prog/web
    - kanjiquizgakkou-prog/pipeline
    - kanjiquizgakkou-prog/ios-fe
    - kanjiquizgakkou-prog/ios-ip
    - kanjiquizgakkou-prog/ios-tk
- I own the domain "goukaku.dev" which is the production deployment
  of these repositories (live at https://goukaku.dev).

WHAT I'M REQUESTING:
Release of the name "goukaku-dev" so I can rename my existing
organization "kanjiquizgakkou-prog" to "goukaku-dev", matching my
production domain.

EVIDENCE OF OWNERSHIP / LEGITIMATE INTEREST:
1. Domain ownership: I can demonstrate ownership of goukaku.dev
   via DNS TXT record or HTML meta tag if needed.
2. Repository ownership: All repositories formerly under goukaku-dev
   are currently under my control at github.com/kanjiquizgakkou-prog.
3. No third-party conflict: No other entity claims this name.
   The cooling-off period exists to prevent squatting, but in this
   case I am the prior owner reclaiming my own organization name.

Could you please either:
(a) Release the name "goukaku-dev" to my account so I can perform
    the rename, OR
(b) Directly rename kanjiquizgakkou-prog → goukaku-dev on my behalf?

If you require domain ownership verification, I can add a TXT record
to goukaku.dev DNS or place a verification file at
https://goukaku.dev/.well-known/ with content of your choosing.

Thank you for your time.

Best regards,
[YOUR_NAME]
GitHub username: [YOUR_GITHUB_USERNAME]
Organization: kanjiquizgakkou-prog
```

## 本文 (日本語版・サブ)

```
GitHub Support 御中

クールオフ期間中の組織名「goukaku-dev」の解放をリクエストいたします。

【背景】
- 私は以前「goukaku-dev」組織のオーナーでした。
- アカウント階層を再構築するため 2026-05-24 頃に同組織を削除し、
  その後別の組織を「goukaku-dev」へ rename する予定でしたが、
  90 日の予約期間に該当することに気付きませんでした。
- 旧 goukaku-dev 配下にあったリポジトリは現在すべて自身の管理下
  「kanjiquizgakkou-prog」に移行済みです:
    - kanjiquizgakkou-prog/web
    - kanjiquizgakkou-prog/pipeline
    - kanjiquizgakkou-prog/ios-fe
    - kanjiquizgakkou-prog/ios-ip
    - kanjiquizgakkou-prog/ios-tk
- これらの本番デプロイ先である「goukaku.dev」ドメイン
  (https://goukaku.dev) も自身が所有しています。

【依頼内容】
名前「goukaku-dev」を解放し、既存組織
「kanjiquizgakkou-prog」を「goukaku-dev」に rename できるよう
ご対応いただけますでしょうか。

【所有/正当性の証拠】
1. ドメイン所有: goukaku.dev は私が登録・運営しており、DNS TXT
   レコードまたは HTML meta タグでの所有確認が可能です。
2. リポジトリ所有: 旧 goukaku-dev 配下のリポジトリは現在すべて
   github.com/kanjiquizgakkou-prog 配下にあります。
3. 第三者との競合なし: 当該名称を主張する他のエンティティは存在
   しません。クールオフは名前のスクワット防止が目的と理解して
   いますが、本件は元オーナーが自身の組織名を再取得するケースです。

可能であれば下記いずれかをお願いいたします:
(a) 「goukaku-dev」を予約期間から解放し、私が rename する
(b) 「kanjiquizgakkou-prog」→「goukaku-dev」の rename を
    Support 側で実施いただく

ドメイン所有の確認方法 (TXT レコード追加、ファイル設置等) について
は、ご指示があればすぐに対応いたします。

よろしくお願いいたします。

[氏名]
GitHub username: [GitHubユーザ名]
組織: kanjiquizgakkou-prog
```

## 送信時の添付/補足

申請フォームに以下を入力:

| フィールド | 値 |
|---|---|
| GitHub username | (user の username) |
| Organization | `kanjiquizgakkou-prog` |
| Issue category | Account → Username and account changes |
| Severity | Normal |

**Attach evidence (任意・推奨)**:
- goukaku.dev のドメイン登録情報スクリーンショット (whois でも可)
- https://goukaku.dev のホームページスクリーンショット (現在運営中の証拠)

## 期待される返答 (3 パターン)

1. **「名前を解放しました」** → user 側で UI から rename 実行
2. **「Support 側で rename を実施しました」** → 即座に新 org 名で全リポジトリ動作
3. **「90 日経過まで待ってください」** → そのまま待つしかない

過去事例では、ドメイン所有者の請求は **3〜7 日で承認** されることが多い (公式 SLA ではなく観測値)。

## Rename 完了後の私側の作業

1. 全 5 リポジトリの local remote URL を `goukaku-dev/*` に統一書き換え
2. コード内に残る `kanjiquizgakkou-prog` 参照を grep して更新
3. ios-tk の README の "remote: This repository moved" 通知が消えることを確認
4. CLAUDE.md 等の docs の組織名表記を確認
