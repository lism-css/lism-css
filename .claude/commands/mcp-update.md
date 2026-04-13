# MCP Server データ更新

`packages/mcp/src/data/` 配下の JSON ファイルを、リポジトリの最新ソースから再生成してください。

> **注:** 参照系ツール（get_overview, get_tokens, get_props_system, get_component, get_guide）は
> `.claude/skills/lism-css-guide/*.md` を正本として Markdown を返却する構成に移行済みです。
> スキルファイルの更新は `/update-skill-template` コマンドで行います。
> このコマンドでは `docs-index.json` のみを更新対象とします。


## 情報の優先順位

1. **パッケージソース（絶対基軸）**: `packages/lism-css/` と `packages/lism-ui/` のソースコードが常に正とする
2. **ドキュメント（補足）**: `apps/docs/` の MDX は解説・説明文の参考として使うが、ソースと矛盾する場合はソースを優先する


## 対象ファイル

### docs-index.json

ドキュメント検索用インデックス。`search_docs` ツールが使用する。

- **ソース**: `apps/docs/src/content/ja/` 配下の全 MDX ファイル
- **更新内容**: 各ページの sourcePath, title, description, category, headings, keywords, snippet
- **title ルール**: primitives カテゴリのエントリは、title に JSX コンポーネント名と CSS クラス名を `コンポーネント名 / クラス名` の形式で併記すること（例: `"Flex / l--flex"`, `"Container / is--container"`, `"Icon / a--icon"`）。クラス名は sourcePath のファイル名部分から取得できる。
- **keywords ルール（CSS 逆引き用）**: props カテゴリや primitives カテゴリのエントリには、関連する CSS プロパティ名を keywords に含める（例: Flex のドキュメントに `"display", "flex", "flex-direction"` を追加、ボーダー props のドキュメントに `"border", "border-radius"` を追加）。これにより CSS プロパティ名での検索精度が向上する
- **keywords ルール（alias 保持）**: MDX に存在しない alias/synonym keywords（例: `"クリッカブル"`, `"横並び折り返し"`, `"CTA"` 等）が既存の keywords に含まれている場合、それらを削除しないこと。これらは自然言語検索の精度向上のために意図的に追加されたものである


## 作業手順

### 1. 事前情報の取得

- `git rev-parse --short HEAD` で現在のコミットハッシュを取得

### 2. サブエージェント起動

`lism-mcp-editor` サブエージェント（sonnet）を 1 並列で起動する。

サブエージェントには以下を伝える：
- 担当: `docs-index.json`
- 参照先: `apps/docs/src/content/ja/` 配下の全 MDX ファイル
- スキーマは変更不可であること

### 3. meta.ts の更新

サブエージェント完了後、`packages/mcp/src/data/meta.ts` の `generatedAt` を今日の日付に、`sourceCommit` を現在の HEAD コミットハッシュに更新する。

### 4. 差分サマリーの報告

変更点のサマリーをユーザーに報告する。


## 注意事項

- JSON の既存フィールドは、明示的に削除指示がない限り保持すること
- ソースに存在しない情報を推測で追加しないこと
- description 等のテキストは日本語で記述すること
