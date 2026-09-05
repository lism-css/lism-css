# Plan: apps/docs を apps/site へリネームする

基準日: 2026-09-05・8a881efc
状態: Ready
関連: [plan-511-docs-to-cloudflare-workers.md](./plan-511-docs-to-cloudflare-workers.md)（このリネームを先に済ませてから#511のPhase 1に入る）

## 概要 / ゴール

公式サイトのワークスペース`apps/docs`を`apps/site`へ、パッケージ名`lism-docs`を`lism-site`へ、ルートの`*:docs`スクリプトを`*:site`へ改名する。完了すると、リポジトリ内で「docs」が指すものは次の2つだけになる。

- `docs/`: プロジェクト文書（`docs/decisions.md`等）
- `/docs/...`: サイトのURLパスと、それに対応するMDXコンテンツ（`apps/site/src/content/{ja,en}/`）

サイトの機能・URL・ビルド成果物は変えない。

## 背景・前提

### 動機

- 「docs」の意味が3つあり、AIエージェントへの指示で紛れる。`apps/docs`（サイト本体）、`docs/`（プロジェクト文書。グローバルの文書規約の標準配置）、`/docs/`（サイトURL）。
- #511（Cloudflare Workers移行）のPhase 1で`wrangler.jsonc`のWorker名、Phase 3でWorkers Buildsのルートディレクトリとビルドコマンドを登録する。Worker名を後から変えられるかは公式ドキュメントで確認できなかった。リネームを先に済ませ、最終名で1回だけ登録する。

### コードで裏取り済みの事実

- `pnpm-workspace.yaml`は`apps/*`のglobなのでワークスペース定義の変更は不要。`pnpm-lock.yaml`の`importers`キー`apps/docs`は`pnpm install`で更新される。
- `apps/docs/package.json`は`"name": "lism-docs"`。`private`フラグなし。
- `apps/docs`配下には`node_modules`・`dist`・`.astro`・`.cache`・`.turbo`・`.claude`・`_screenshots/{diff,temp}`など、未追跡またはignore対象のディレクトリがある。
- `apps/docs/scripts/generate-lastmod-map.ts`は`git log --name-only -- 'apps/docs/src/content' ...`でファイル別の最終コミット日時を集め、`^apps\/docs\/src\/...`の正規表現でURLへ変換する。パスを単純に置換すると、リネームコミットより前の履歴が見えなくなり、全URLのlastmodがリネーム日になる。
- `packages/mcp/src/tests/docs-index.test.ts`は`apps/docs/src/content/ja`の存在を`describe.skipIf`で判定する。パスを直し忘れてもテストは失敗せずスキップされる。
- `packages/mcp/src/data/docs-index.json`の`sourcePath`は`content/ja`相対（例: `overview.mdx`）で`apps/docs`を含まない。再生成は不要。
- Vercel はダッシュボードの Root Directory を`apps/docs`にして`apps/docs/vercel.ts`（`buildCommand: 'cd ../.. && pnpm build:docs'`）を読んでいる。この設定はリポジトリ外。
- `.github/workflows/test.yml`・`.vscode/*`・`.prettierignore`・eslint設定に`apps/docs`の参照はない。
- `apps/docs/src/content`・`src/pages`・`src/components/templates`配下に`apps/docs`という文字列を含むファイルはない。リネームコミットでこれらは内容変更なしの移動になる。

### 参照箇所の一覧（`pnpm-lock.yaml`除く）

| 文字列 | 箇所 |
| --- | --- |
| `apps/docs` | 31ファイル。`.claude/`11、`documents/`6、`packages/mcp/`3、`apps/docs/`内3、`docs/decisions.md`、`.plan/plan-511-*`、`CLAUDE.md`、`.gitignore`、`turbo.json`、`package.json`、`scripts/sync-cdn-versions.mjs`、`templates/manifest.ts` |
| `lism-docs` | `package.json`10行、`apps/docs/package.json`、`apps/docs/src/lib/pageHelpers.ts`、`apps/docs/src/components/KvEditor/README.md`、`documents/`2、`docs/decisions.md`、`.plan/plan-511-*`4行 |
| `dev:docs`・`build:docs`・`format:docs`・`check:docs` | `package.json`、`CLAUDE.md`、`apps/docs/vercel.ts`、`.claude/commands/docs-translation.md`、`documents/docs-update.md`、`.plan/plan-511-*` |

## 実装プラン

1PRで行う。`dev`から`chore/rename-apps-site`を切る。手順2〜8は途中で止めるとビルドが壊れるので、1コミットにまとめてよい。

### 1. 事前準備

- 作業ツリーをクリーンにする。基準日時点で`apps/docs/src/content/*/changelog.mdx`等に未コミット変更があり、そのままだとリネームコミットに混ざる。先にコミットするかstashする。
- `nr dev:docs`が起動中なら止める。

### 2. ディレクトリ移動とロックファイル

- `git mv apps/docs apps/site`。ディレクトリごとファイルシステム上でリネームされるので、`node_modules`等の未追跡ファイルも一緒に移る。移動後に`apps/docs`が残っていないことを確認する。残っていたら中身がignore対象だけであることを確認して削除する。
- ルートで`pnpm install`を実行し、`pnpm-lock.yaml`の`importers`キーが`apps/site`になった差分をコミットに含める。

### 3. パッケージ名・スクリプト名

- `apps/site/package.json`: `"name": "lism-site"`
- ルート`package.json`:
  - `dev:docs`→`dev:site`（中身も`cd apps/site`）、`build:docs`→`build:site`、`format:docs`→`format:site`（`--filter=./apps/site`）、`check:docs`→`check:site`
  - `screenshot:*`8行・`check:site`・`deploy`の`--filter lism-docs`→`--filter lism-site`
  - `deploy`の`git add apps/docs/lastmod-map.json`→`apps/site/lastmod-map.json`
- `apps/site/vercel.ts`: `buildCommand: 'cd ../.. && pnpm build:site'`
- `apps/site/src/lib/pageHelpers.ts`のエラーメッセージ内`pnpm --filter lism-docs og:font`と、`apps/site/src/components/KvEditor/README.md`の`--filter=lism-docs`

### 4. 設定ファイル

- `.gitignore`: `apps/docs/_screenshots/diff/`と`apps/docs/_screenshots/temp/`を`apps/site/...`にする
- `turbo.json`: `build:mcp-data`の`inputs`にある`apps/docs/src/content/ja/**/*.mdx`

### 5. コード内のパス参照

- `scripts/sync-cdn-versions.mjs`: 対象MDXの6パス
- `packages/mcp/src/tests/docs-index.test.ts`: `docsContentDir`の`'apps', 'docs'`と動的importの`../../../../apps/docs/src/lib/contentSlug.js`。コメントとテスト名も置換する
- コメントのみ: `packages/mcp/src/lib/search.ts`、`packages/mcp/ARCHITECTURE.md`、`templates/manifest.ts`、`apps/site/scripts/template-screenshots.ts`、`apps/site/src/integrations/docs-md/build-llms-txt.ts`

### 6. lastmod生成スクリプトのリネーム対応

`apps/site/scripts/generate-lastmod-map.ts`の`getGitLastModifiedMap`を次のように変える。

- 定数を置く。`SITE_DIR = 'apps/site'`、`LEGACY_SITE_DIR = 'apps/docs'`（リネーム前のパス。古いコミットはこのパスで出てくる）、対象サブディレクトリ`['src/content', 'src/pages', 'src/components/templates']`。pathspecは新旧両方のプレフィックスで組み立てる。
- `--name-only`を`-M --name-status`に変える。行の形式は`M\tpath`・`A\tpath`・`D\tpath`・`R{類似度}\told\tnew`。
- `R100`（内容変更なしの移動）のうち、`old`が`apps/docs/`配下、`new`が`apps/site/`配下で、それぞれのプレフィックスを除いた相対パスが一致する行だけ読み飛ばす。今回のワークスペース移動で日時が更新されるのを防ぐ。
- 上記以外の`R`は、`R100`も含めて`new`側のパスを使う。過去のコンテンツ移動は現行どおり更新日時の対象とする。
- 得たパスが`apps/docs/`で始まれば`apps/site/`に読み替えてから、既存の`existsSync`判定と「最初に見つかった日時が最新」のロジックに渡す。
- `filePathToSiteUrls`の正規表現3箇所とdocコメントの例を`apps/site`にする。
- 検証: `pnpm --filter lism-site generate:lastmod`をリネームコミット前とコミット後の両方で実行し、生成した`apps/site/lastmod-map.json`がリネーム前のJSONと一致することを確認する。コミット後の実行で、今回の移動履歴を読み飛ばしても既存の日時を保持できることを確かめる。日本語・英語の`DividerLabel.mdx`に対応する3URLも日時を保持し、JSON全体の差分ゼロを完了条件とする。

### 7. ドキュメント・エージェント定義の置換

対象: `CLAUDE.md`、`.claude/agents/*`3件、`.claude/commands/*`7件、`.claude/skills/lism-docs-translation/SKILL.md`、`documents/*`6件、`docs/decisions.md`、`.plan/plan-511-docs-to-cloudflare-workers.md`。

- `apps/docs`→`apps/site`、`lism-docs`→`lism-site`、`*:docs`→`*:site`を機械的に置換する。エージェント名・コマンド名・ファイル名（`lism-docs-editor`、`docs-update`、`documents/docs-update.md`等）は変えない。
- `CLAUDE.md`は加えて、「apps」節のリンク先、「主要コマンド」、「公式ドキュメントサイト(`apps/docs`)のURL」見出しを直し、「`docs/`はプロジェクト文書、サイト本体は`apps/site`」という1行を足す。
- `.plan/plan-511-*`は`wrangler.jsonc`の`"name"`も`lism-site`にし、`*.workers.dev`のURL例も追従させる。
- `documents/*`の基準日行は更新しない。パス置換のみで内容の再確認はしていないため。

### 8. `docs/decisions.md`へ記録

「## YYYY-MM-DD: 公式サイトのワークスペースは`apps/site`と呼ぶ」のエントリを追加する（日付は実装日）。背景として「docs」の3重の意味と#511の前に済ませる理由を1段落で書き、次を箇条書きにする。

- 決定: `apps/site`・パッケージ名`lism-site`・ルートスクリプト`*:site`
- 却下: `apps/web`は意味が広い。`@lism-css/site`はスコープを変える必要がないため見送り
- 対象外: URLパス`/docs/`とエージェント名・コマンド名は変えない

### 9. 検証

- `rg -n 'apps/docs|lism-docs|(dev|build|format|check):docs' --hidden -g '!node_modules' -g '!dist' -g '!.git'`のヒットが、このプランと`docs/decisions.md`の新エントリだけになる
- `pnpm install --frozen-lockfile`が通る（ロックファイル更新漏れの検出）
- `nr build:site`・`nr typecheck`・`nr lint`が通る
- `pnpm --filter @lism-css/mcp test`で「docs-index.json の構造検証」がスキップではなく実行され、通る
- 手順6のコミット前・コミット後の検証がともに通る
- `nr dev:site`が起動する

### 10. Vercel 側の設定（リポジトリ外・手作業）

- Vercel ダッシュボードの Root Directory を`apps/docs`から`apps/site`に変える。ダッシュボード変更だけでは本番は再ビルドされないので、`main`に到達する前に変えてよい。
- タイミングはこのPRを`dev`にマージした直後。Vercel が`dev`のプレビューをビルドしている場合、変えるまで`dev`のビルドは失敗する（本番には影響しない）。
- 次の`nr deploy`（`dev`→`main`）で`apps/site`のままビルドされることを Vercel のデプロイログで確認する。

## 設計判断の根拠

- `apps/site`: サイト本体を指す最短の語。`apps/web`はアプリ全般を連想させ、`apps/website`は長い。
- `lism-site`（スコープなし）: `lism-docs`がスコープなしだったので同じ形にし、差分を名前の置換に抑える。`@lism-css/catalog`と揃える`@lism-css/site`は必要が出たときに別途。
- `*:site`スクリプト名: `build:docs`が残ると「docsをビルドする」と読めて混乱が戻る。
- lastmodスクリプトを直す（リセットを受容しない）: 全URLのlastmodがリネーム日になると、sitemap経由で検索エンジンへ「全ページ更新」を誤って伝える。すべての`R100`を除外すると、過去に移動した日本語・英語の`DividerLabel.mdx`（`7001c377`）の日時を取得できず、対応する3URLのlastmodが欠落する。そのため、除外は手順6のワークスペース移動に限定する。コンテンツ個別の移動は現行の扱いを維持し、ファイルごとに`--follow`を回す案は遅いので却下。
- エージェント名・コマンド名・`documents/docs-*.md`は据え置き: それらの「docs」はMDXコンテンツ（URL`/docs/`配下）を指す。`apps/site`との衝突はこのリネームで解消される。
- 1PR: 移動と参照の更新を分けるとどの時点でもビルドが壊れる。

## 未決事項・要確認・事前準備

- Vercel が`dev`ブランチのプレビューをビルドしているか未確認。している場合は手順10のタイミングに従う。
- `apps/site/package.json`に`"private": true`を足すか。スコープ外だが、公開予定のないワークスペースなので同じPRで足してよい。
- #511プランの`wrangler.jsonc`の`name`は`lism-site`にする前提。別の Worker 名にしたい場合は手順7で指定する。

## 対象外

- サイトのURLパス`/docs/`、コンテンツディレクトリ`src/content`、`docs-md`インテグレーション名
- `.claude/`のエージェント名・コマンド名・スキル名
- `packages/mcp`のdocs-index再生成

## 完了条件

手順9がすべて通り、手順10の Vercel 設定変更が済み、次のデプロイで`lism-css.com`が正常に配信されていること。
