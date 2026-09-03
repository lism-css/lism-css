基準日: 2026-09-03・コミット105422df

# apps/docs 更新作業の入口

この文書が持つもの: `apps/docs`を更新するときに、どのコマンド・スクリプトを使うかの入口と委譲先。
持たないもの: 各処理の中身（`docs-md` integrationは[docs-md.md](./docs-md.md)、コマンドの手順は`.claude/commands/`配下）。


## package更新を反映する

`packages/lism-css` / `packages/lism-ui`の実装（Props・CSS・コンポーネント）が変わったら`/docs-update`を使う。`lism-docs-editor`サブエージェントをディレクトリグループ単位で並列起動し、Props名・コード例・HTML出力・importパス・リンク切れをソースと突き合わせて1パスで修正する。手順は`.claude/commands/docs-update.md`。

### CDN URLのバージョン番号

`packages/lism-css`のバージョンを上げても、MDXやREADMEのCDN URL（`cdn.jsdelivr.net/npm/lism-css@x.y.z/...`）は自動では変わらない。`nr sync:cdn-versions`が`packages/lism-css/package.json`の`version`を正として一括で書き換える。対象は`scripts/sync-cdn-versions.mjs`の`targets`。


## 翻訳する

`content/ja/`を正として`content/en/`へ同期するには`/docs-translation`を使う。ja / enの差分を新規・更新・削除・スキップに分類し、ユーザーの実行確認を得てから`lism-docs-translator`サブエージェントを並列起動する。手順は`.claude/commands/docs-translation.md`。

| 引数 | 対象 |
| --- | --- |
| なし | `ja/`配下の全`.mdx` |
| `root` | `ja/`直下のみ（サブディレクトリ除外） |
| `ui/` | 指定ディレクトリ配下 |
| `overview.mdx` | 指定した1ファイル |


## llms.txt

個別に更新するコマンドは無い。`nr build:docs`時に`docs-md` integrationが`content/en/`のフロントマターから`dist/llms.txt`を生成する。詳細は[docs-md.md](./docs-md.md)。


## sitemapのlastmod

`apps/docs/lastmod-map.json`（コミット対象）を`src/lib/sitemap-lastmod.ts`が読む。CI環境はgit履歴が浅く正確な日時を取れないため、全履歴のあるローカルで`pnpm --filter lism-docs generate:lastmod`を実行してコミットする。ルートの`nr deploy`がmainへのマージ前にこれを行うので、通常は任せる。手でmainへマージする場合は再生成を忘れない。
