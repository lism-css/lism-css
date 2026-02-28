# MCP Server データ更新

`packages/mcp-server/src/data/` 配下の JSON ファイルを、リポジトリの最新ソースから再生成してください。

## 対象ファイルとデータソース

以下の 5 つの JSON を、指定されたソースを読み取って最新化してください。
既存の JSON の構造（スキーマ）は変更せず、内容だけを更新すること。

### 1. `overview.json`
- **参照先**: `packages/lism-css/package.json`, `packages/lism-ui/package.json`, `apps/docs/src/content/docs/ja/overview.mdx`, `apps/docs/src/content/docs/ja/installation.mdx`, `apps/docs/src/content/docs/ja/css-methodology.mdx`
- **更新内容**: description, packages（バージョン含む）, architecture, installation, cssLayers, classNaming, propAbbreviations
- **注意**: get_overview のレスポンスは Markdown 形式に変換されるため、各フィールドのテキストはそのまま読みやすい形で記述すること（特に installation フィールドは Markdown 記法で記述）

### 2. `tokens.json`
- **参照先**: `packages/lism-css/src/scss/token/` 配下の SCSS ファイル, `apps/docs/src/content/docs/ja/tokens.mdx`
- **更新内容**: 各カテゴリ（color, spacing, fontSize, lineHeight, letterSpacing, fontFamily, radius, shadow, zIndex）のトークン一覧

### 3. `props-system.json`
- **参照先**: `packages/lism-css/src/config/` 配下の設定ファイル, `apps/docs/src/content/docs/ja/props/` 配下の MDX ファイル
- **更新内容**: 各カテゴリの prop 一覧（prop名, cssProperty, type, responsive, values）

### 4. `components.json`
- **参照先**: `packages/lism-css/src/components/` と `packages/lism-ui/src/components/` 配下のコンポーネントソース, `apps/docs/src/content/docs/ja/modules/` と `apps/docs/src/content/docs/ja/ui/` 配下の MDX
- **更新内容**: 全コンポーネントの name, package, category, description, props, usage

### 5. `docs-index.json`
- **参照先**: `apps/docs/src/content/docs/ja/` 配下の全 MDX ファイル
- **更新内容**: 各ページの sourcePath, title, description, category, headings, keywords, snippet

## 作業手順

1. 既存の各 JSON ファイルを読み、現在の構造（スキーマ）を把握する
2. 上記の参照先ソースを読み取る
3. 新しい情報があれば追加、古い情報があれば更新・削除する
4. 各 JSON ファイルを書き出す
5. `packages/mcp-server/src/data/meta.ts` の `generatedAt` を今日の日付に、`sourceCommit` を現在の HEAD コミットハッシュに更新する
6. 最後に差分のサマリーを報告する

## 注意事項

- JSON のスキーマ（フィールド名・型の構造）は変更しないこと。スキーマ定義は `packages/mcp-server/src/lib/schemas.ts` を参照
- ソースに存在しない情報を推測で追加しないこと
- description 等のテキストは日本語で記述すること
- 1ファイルずつ順番に処理し、各ファイルの更新内容を簡潔に報告すること
