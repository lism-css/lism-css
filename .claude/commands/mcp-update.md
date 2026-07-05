# MCP Server データ更新

`packages/mcp/src/data/` 配下の JSON ファイルを、リポジトリの最新ソースから再生成してください。

> **注:** 参照系ツール（get_overview, get_tokens, get_props_system, get_component, get_guide）は
> `skills/lism-css-guide/*.md` を正本として Markdown を返却する構成に移行済みです。
> スキルファイルの更新は `/update-skill-template` コマンドで行います。
> このコマンドでは `docs-index.json` のみを更新対象とします。


## 情報の優先順位

1. **パッケージソース（絶対基軸）**: `packages/lism-css/` と `packages/lism-ui/` のソースコードが常に正とする
2. **ドキュメント（補足）**: `apps/docs/` の MDX は解説・説明文の参考として使うが、ソースと矛盾する場合はソースを優先する


## 対象ファイル

### docs-index.json

ドキュメント検索用インデックス。`search_docs` ツールが使用する。

- **ソース**: `apps/docs/src/content/ja/` 配下の MDX ファイル。ただし以下は対象外とする:
  - ファイル名・ディレクトリ名が `_` で始まるもの（例: `_demo/` 配下）
  - `test.mdx`（この正確なファイル名のみ。「テスト用らしい」他のファイルを拡大解釈で除外しない）
  - この除外定義は `packages/mcp/src/tests/docs-index.test.ts` の `listIndexableMdxFiles` と一致させている（テスト側が正）
- **更新内容**: 各ページの sourcePath, title, description, category, headings, keywords, snippet
- **エントリ作成・更新の詳細ルール**（sourcePath の casing、title の併記形式、keywords の付与・保持ルール等）は `.claude/agents/lism-mcp-editor.md` を正本とする。このファイルには重複記載しない


## 作業手順

### 1. 事前情報の取得

- `git rev-parse --short HEAD` で現在のコミットハッシュを取得

### 2. サブエージェント起動

`lism-mcp-editor` サブエージェント（sonnet）を 1体起動する。

サブエージェントには以下を伝える：
- 担当: `docs-index.json`
- 参照先: `apps/docs/src/content/ja/` 配下の MDX ファイル（上記の除外ルールも含めて伝える）
- スキーマは変更不可であること
- 実ファイルが存在しないエントリ（削除候補）は削除せず、報告のみ行うこと

### 3. meta.ts の更新

サブエージェント完了後、`packages/mcp/src/data/meta.ts` の `generatedAt` を今日の日付（`YYYY-MM-DD`）に、`sourceCommit` を現在の HEAD コミットハッシュに更新する。`docsVersion` は `packageVersion` から自動取得されるため変更しない。

### 4. テストによる検証

`packages/mcp` のテストを実行し（`pnpm --filter @lism-css/mcp test`）、`docs-index.test.ts` による sourcePath の実在チェック等が通ることを確認する。実行は `runner` サブエージェントに任せてよい。失敗した場合は原因を修正してから次へ進む。

### 5. 差分サマリーの報告

変更点のサマリーをユーザーに報告する。サブエージェントから削除候補のエントリが報告された場合は、削除せずに一覧で提示し、ユーザーの承認を得てから削除する。


## 注意事項

- JSON の既存フィールドは、明示的に削除指示がない限り保持すること
- 実ファイルが存在しないエントリの削除は、必ずユーザーの承認を得てから行うこと
- ソースに存在しない情報を推測で追加しないこと
- description 等のテキストは日本語で記述すること
