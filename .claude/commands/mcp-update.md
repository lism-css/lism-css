# MCP Server データ更新

`packages/mcp/src/data/` 配下の JSON ファイルを、リポジトリの最新ソースから再生成してください。


## 情報の優先順位

1. **パッケージソース（絶対基軸）**: `packages/lism-css/` と `packages/lism-ui/` のソースコードが常に正とする
2. **ドキュメント（補足）**: `apps/docs/` の MDX は解説・説明文の参考として使うが、ソースと矛盾する場合はソースを優先する


## 対象ファイルとグループ分け

5 つの JSON を 3 グループに分けて `lism-mcp-editor` サブエージェント（sonnet）で並列更新する。
既存の JSON のスキーマ（フィールド名・型の構造）は変更せず、内容だけを更新すること。

### グループ A: `overview.json` + `tokens.json`

#### overview.json
- **ソース**: `packages/lism-css/package.json`, `packages/lism-ui/package.json`
- **補足 docs**: `apps/docs/src/content/ja/overview.mdx`, `apps/docs/src/content/ja/installation.mdx`, `apps/docs/src/content/ja/css-methodology.mdx`
- **更新内容**: description, packages（バージョン含む）, architecture, installation, cssLayers
- **注意**: get_overview のレスポンスは Markdown 形式に変換されるため、各フィールドのテキストはそのまま読みやすい形で記述すること（特に installation フィールドは Markdown 記法で記述）

#### tokens.json
- **ソース**: `packages/lism-css/src/scss/token/` 配下の SCSS ファイル
- **補足 docs**: `apps/docs/src/content/ja/tokens.mdx`
- **更新内容**: 各カテゴリ（color, spacing, fontSize, lineHeight, letterSpacing, fontFamily, radius, shadow, zIndex）のトークン一覧

### グループ B: `props-system.json` + `components.json`

#### props-system.json
- **ソース**: `packages/lism-css/src/config/` 配下の設定ファイル
- **補足 docs**: `apps/docs/src/content/ja/props/` 配下の MDX ファイル
- **更新内容**: 各カテゴリの prop 一覧（prop名, cssProperty, type, responsive, values）

#### components.json
- **ソース**: `packages/lism-css/src/components/`, `packages/lism-ui/src/components/`, `packages/lism-css/config/defaults/`
- **補足 docs**: `apps/docs/src/content/ja/modules/` と `apps/docs/src/content/ja/ui/` 配下の MDX
- **更新内容**: 全コンポーネントの name, package, category, description, aliases, props, usage
- **aliases ルール**: ユーザーが自然言語で検索しそうなキーワードを含める

### グループ C: `docs-index.json`

#### docs-index.json
- **ソース**: `apps/docs/src/content/ja/` 配下の全 MDX ファイル
- **更新内容**: 各ページの sourcePath, title, description, category, headings, keywords, snippet
- **title ルール**: modules カテゴリのエントリは、title に JSX コンポーネント名と CSS クラス名を `コンポーネント名 / クラス名` の形式で併記すること（例: `"Flex / l--flex"`, `"Container / is--container"`, `"Icon / a--icon"`）。クラス名は sourcePath のファイル名部分から取得できる。


## 作業手順

### 1. 事前情報の取得

親エージェントは以下だけ取得する（ソースの詳細読み取りはサブエージェントに任せる）：

- `packages/lism-css/package.json`, `packages/lism-ui/package.json` からバージョン情報を取得
- `git rev-parse --short HEAD` で現在のコミットハッシュを取得

### 2. サブエージェント 3 並列起動

`lism-mcp-editor` サブエージェント（sonnet）をグループ A / B / C で 3 並列に起動する。

各サブエージェントには以下を伝える：
- 担当する JSON ファイル名とグループ
- 参照すべきソースファイルのパス一覧（内容はサブエージェント自身が読み取る）
- バージョン情報（事前取得した値）
- スキーマは変更不可であること

### 3. meta.ts の更新

全サブエージェントの完了後、`packages/mcp/src/data/meta.ts` の `generatedAt` を今日の日付に、`sourceCommit` を現在の HEAD コミットハッシュに更新する。

### 4. 差分サマリーの報告

各サブエージェントの結果をまとめて、変更点のサマリーをユーザーに報告する。


## 注意事項

- JSON の既存フィールドは、明示的に削除指示がない限り保持すること（値の更新・新規フィールドの追加のみ行う）
- `packages/mcp/src/lib/schemas.ts` は MCP ツールレスポンスのバリデーション用スキーマであり、JSON データファイルの構造を制約するものではない。schemas.ts に無いフィールドが JSON にあっても、それは削除理由にならない
- ソースに存在しない情報を推測で追加しないこと
- description 等のテキストは日本語で記述すること
