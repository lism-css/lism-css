# MCP サーバー アーキテクチャガイド

このドキュメントでは、`@lism-css/mcp` パッケージの全体像と処理の流れを解説します。


## MCP とは

**MCP（Model Context Protocol）** は、AI アシスタント（Claude など）が**外部のデータやツールにアクセスするための標準プロトコル**です。

```
┌───────────────────┐         MCP プロトコル         ┌──────────────────┐
│   MCP クライアント │  ◄───── JSON-RPC 通信 ─────►  │   MCP サーバー    │
│  (Claude Code等)  │         (標準入出力)           │ (このパッケージ)  │
└───────────────────┘                                └──────────────────┘
       │                                                     │
  AI がツールを                                        ツールを実行し
  呼び出す                                             結果を返す
```


## Stdio トランスポートの仕組み

このサーバーは **Stdio（標準入出力）方式** を採用しており、**クライアント（Claude Code等）が子プロセスとして自動で起動・終了**します。HTTP サーバーを常駐させる必要はありません。


## このMCPサーバーの役割

Lism CSS のドキュメント・API情報を、AI が正確に参照できるようにするためのサーバーです。

### 提供するツール（7つ）

| ツール名 | 用途 | 返却形式 | 入力パラメータ |
|---------|------|---------|--------------|
| `get_overview` | フレームワークの概要を取得 | Markdown | （なし） |
| `get_tokens` | デザイントークンを取得 | Markdown | （なし） |
| `get_props_system` | Props → CSS マッピングを参照 | Markdown | `prop?`: Lism prop 名 or CSS プロパティ名 |
| `get_component` | コンポーネントの詳細を取得 | Markdown | `name`: コンポーネント名（`"Flex"` / `"<Flex>"` / `"l--flex"` / `"flex"` を同一視）, `package?`: `"lism-css"` \| `"@lism-css/ui"` |
| `get_guide` | 特定トピックのガイドを取得 | Markdown | `topic`: 11 トピックから選択（後述） |
| `search_docs` | ドキュメントをキーワード検索 | JSON | `query`: 検索キーワード, `category?`, `limit?` |
| `convert_css` | CSS を lism-css props に変換 | JSON | `css`: CSS コード（宣言のみ、@ルール非対応） |


## ファイル構成

```
packages/mcp/
├── bin/
│   └── lism-mcp.mjs           # 実行エントリポイント（dist/index.js を import）
├── src/
│   ├── index.ts                # サーバー初期化・起動（プリロード → ツール登録 → connect）
│   ├── lib/
│   │   ├── load-data.ts        # JSON データ読み込み + Zod バリデーション + キャッシュ
│   │   ├── load-markdown.ts    # Markdown ガイド読み込み（Skill-First: skills/ → dist/ フォールバック）
│   │   ├── markdown-utils.ts   # Markdown パーサー（セクション抽出・テーブル解析・コンポーネント検索）
│   │   ├── schemas.ts          # Zod スキーマ定義（DocsEntrySchema）
│   │   ├── search.ts           # 検索ロジック（トークナイズ・クエリ展開・スコアリング）
│   │   ├── response.ts         # レスポンスフォーマット（Markdown / JSON / error）
│   │   └── types.ts            # TypeScript 型定義（MetaInfo, SearchResult, DocsEntry）
│   ├── tools/
│   │   ├── get-overview.ts     # SKILL.md + css-rules.md の Layer 構造 + prop-responsive.md の BP
│   │   ├── get-tokens.ts       # tokens.md をそのまま返却
│   │   ├── get-props-system.ts # property-class.md の全文 or prop 名で絞り込み検索
│   │   ├── get-component.ts    # modules/*.md → components-core.md → components-ui.md の順で名前解決
│   │   ├── get-guide.ts        # 11 トピックから指定した Markdown ガイドを返却
│   │   ├── search-docs.ts      # docs-index.json をスコアリング検索（CSS プロパティ名自動展開）
│   │   └── convert-css.ts      # CSS 宣言をパース → prop マッピング + コンポーネント提案 + 使用例
│   ├── data/
│   │   ├── meta.ts             # メタ情報（生成日時・コミットハッシュ・バージョン）
│   │   └── docs-index.json     # ドキュメント検索インデックス（/mcp-update で更新）
│   └── tests/
│       ├── search.test.ts
│       ├── tools.test.ts
│       └── convert-css.test.ts

├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── README.md
├── README.ja.md
└── .gitignore
```


## データソースと生成フロー

### Skill-First アーキテクチャ

```
① パッケージソース（最上位の事実）
   packages/lism-css/, packages/lism-ui/
        │
        │  手動で整理（/update-skill-template コマンド）
        ▼
② skills/lism-css-guide/
        ├─ *.md                  # ルート直下のトピック別ガイド
        └─ modules/{l--|is--|a--}*.md  # プリミティブ単位の詳細ファイル
        │
        ├─ load-markdown.ts が再帰的に直接参照（開発・テスト時）
        │   skillsDir が存在すれば優先、なければ distDir にフォールバック
        │
        └─ pnpm build（cp -r）→ dist/data/guides/**/*.md（npm 配布時）
```

参照系ツール（get_overview, get_tokens, get_props_system, get_component, get_guide）は **Markdown を直接返却**します。

`get_component` は modules/ 配下の個別ファイルを **第一候補**として解決します。起動時に `modules/*.md` の先頭見出し（例: `# l--flex / \`<Flex>\``）をパースしてクラス名・コンポーネント名の alias map を構築し、`Flex` / `<Flex>` / `l--flex` / `flex` の表記揺れを同一視します。

### docs-index.json

ドキュメント検索インデックス（`search_docs` 用）は Markdown では代替不可のため、JSON として維持しています。`/mcp-update` コマンドで更新します。

### ガイドファイル一覧（get_guide で選択可能な topic）

| topic | ファイル | 内容 |
|-------|---------|------|
| `overview` | SKILL.md | フレームワーク概要・パッケージ・実装ルール |
| `tokens` | tokens.md | デザイントークン（spacing, colors, font-size 等） |
| `property-class` | property-class.md | Property Class システム・全 props リファレンス表 |
| `components-core` | components-core.md | コアコンポーネント（Lism, Box, Flex, Stack, Grid 等） |
| `components-ui` | components-ui.md | UI コンポーネント（Accordion, Modal, Tabs, Button 等） |
| `base-styles` | base-styles.md | ベーススタイリング・リセット CSS・HTML 要素スタイル |
| `set-class` | set-class.md | Set クラス（set--plain, set--var:sh, set--var:hov 等） |
| `primitive-class` | primitive-class.md | Primitive クラスプレフィックス（is--, l--, a--）と Component クラス（c--） |
| `utility-class` | utility-class.md | ユーティリティクラス（u--trim, u--cbox 等） |
| `css-rules` | css-rules.md | CSS 設計方法論・Layer 構造・命名規則 |
| `responsive` | prop-responsive.md | レスポンシブ設計・ブレークポイント・コンテナクエリ |

個別プリミティブ（`l--flex`, `is--container`, `a--icon` 等）は `get_guide` の topic としては露出しません。代わりに `get_component` から名前ベースで取得できます。


## 処理の流れ

### 1. サーバー起動

```
bin/lism-mcp.mjs
  └─► dist/index.js (main())
        │
        ├─ 1) preloadAll()       ← docs-index.json を Zod バリデーション付きでメモリに読み込み
        ├─ 2) preloadGuides()    ← guides/ 内の全 .md をメモリに読み込み
        ├─ 3) new McpServer()    ← MCPサーバーインスタンス生成（name: 'lism-css'）
        ├─ 4) register*() ×7    ← 7つのツールを個別に登録
        └─ 5) server.connect()  ← StdioServerTransport で標準入出力の待ち受け開始
```

### 2. ツール呼び出し（例）

**参照系（Markdown 返却）: get_tokens**
```
クライアント: get_tokens({})
  └─► ツールハンドラ実行
        ├─ loadMarkdown('tokens.md')  ← キャッシュから即取得（ファイルI/Oなし）
        └─► markdownResponse(content)  ← { content: [{ type: 'text', text: <Markdown> }] }
```

**検索系（JSON 返却）: search_docs**
```
クライアント: search_docs({ query: "padding", limit: 10 })
  └─► ツールハンドラ実行
        ├─ loadJSON('docs-index.json')              ← キャッシュから取得
        ├─ buildCssPropertyMapFromMarkdown(md)       ← CSS プロパティ名 → Lism props マップ構築
        ├─ searchDocs(entries, query, options)
        │     ├─ expandQuery("padding")              ← "padding p" に自動展開
        │     ├─ tokenize() で分割
        │     ├─ 各エントリをスコアリング（title=10, keyword=5, heading=3, description=2, snippet=1）
        │     └─ スコア順ソート → 上位 limit 件を返却
        └─► success({ query, results })              ← { meta, query, results } (JSON)
```

**変換系（JSON 返却）: convert_css**
```
クライアント: convert_css({ css: "display: flex; gap: 20px;" })
  └─► ツールハンドラ実行
        ├─ detectAtRules(css)                         ← @ルール検出（あればエラー）
        ├─ parseCssDeclarations(css)                   ← セレクタ除去 → 括弧ネスト考慮の ; 分割
        ├─ buildMappings(property-class.md)             ← PropMapping[] 構築
        ├─ 各宣言を cssPropertyMap で変換              ← confidence: exact/approximate/unmapped
        ├─ detectComponent(declarations)               ← Stack/Center/Flex/Grid を自動検出
        ├─ buildExample(conversions, component)        ← JSX 使用例を生成
        └─► success({ conversions, suggestedComponent, example, tip })
```

### 3. レスポンスの形式

| 形式 | 対象ツール | 生成関数 |
|------|----------|---------|
| **Markdown** | get_overview, get_tokens, get_props_system, get_component, get_guide | `markdownResponse()` |
| **JSON** | search_docs, convert_css | `success()` / `error()` / `notFound()` |

JSON レスポンスには `meta`（生成日時・コミットハッシュ・バージョン）が付与されます。


## ツール登録の仕組み

各ツールは `server.registerTool()` で登録します。引数を取るツールは Zod スキーマで `inputSchema` を定義します。

```typescript
// 引数なしのツール
server.registerTool(
    'get_tokens',
    {
        description: 'Get design tokens...',
        annotations: READ_ONLY_ANNOTATIONS,
    },
    () => markdownResponse(loadMarkdown('tokens.md'))
);

// 引数ありのツール
server.registerTool(
    'get_guide',
    {
        description: 'Get a detailed guide...',
        inputSchema: {
            topic: z.enum([...]).describe('The guide topic to retrieve.'),
        },
        annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ topic }) => markdownResponse(loadMarkdown(GUIDE_TOPICS[topic].file))
);
```

全ツールは読み取り専用（`readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`）です。


## 主要ライブラリの役割

### load-markdown.ts — Markdown 読み込みとキャッシュ

```
参照順:
  1. skills/lism-css-guide/ （開発時の正本）
  2. dist/data/guides/              （npm パッケージ配布時のフォールバック）
```

起動時に `preloadGuides()` がサブディレクトリ配下も含めて再帰的に全 `.md` ファイルをメモリキャッシュに載せ、ツール実行時のファイル I/O を排除します。キャッシュキーは `guidesDir` からの posix 相対パス（例: `SKILL.md`, `modules/l--flex.md`）。

### markdown-utils.ts — Markdown パーサー

- `extractSection(md, heading)`: 指定見出しのセクション全体を抽出（同レベル以上の次見出しまで）
- `listHeadings(md)`: 全見出しとその行番号を返却
- `parsePropRows(md)`: property-class.md のテーブルを解析し `PropRow[]` を返却
- `findComponentByHeading(md, name)`: `## ComponentName` 形式の見出しでセクション検索
- `findComponentInTables(md, name)`: テーブル内の `` `<ComponentName>` `` からセクション全体を返却

### search.ts — 検索ロジック

- `parsePropClassName(input)`: Property Class 記法（`"-g:5"`, `".-p"`）から prop 名を抽出
- `expandQuery(query, cssPropertyMap)`: CSS プロパティ名や Property Class 記法を Lism prop 名に自動展開
- `searchDocs(entries, query, options)`: トークナイズ → スコアリング → ソート → 上位 N 件返却


## 使い方

### Claude Code での設定

```json
{
  "mcpServers": {
    "lism-css": {
      "command": "node",
      "args": ["/path/to/packages/mcp/bin/lism-mcp.mjs"]
    }
  }
}
```

### npm パッケージとして

```json
{
  "mcpServers": {
    "lism-css": {
      "command": "npx",
      "args": ["@lism-css/mcp"]
    }
  }
}
```

### 開発

```bash
cd packages/mcp
pnpm build    # TypeScript コンパイル + docs-index.json コピー + skills/ から guides/ をコピー
pnpm test     # Vitest でテスト実行
pnpm dev      # TypeScript ウォッチモード
```


## 設計判断のまとめ

| 設計 | 理由 |
|------|------|
| **Skill-First** | スキル Markdown を正本とし、JSON との二重管理を解消 |
| **Markdown 返却** | AI にとって自然なフォーマット。パース不要で即座に活用可能 |
| **Stdio トランスポート** | HTTP サーバー不要。プロセス起動するだけで動く |
| **起動時プリロード** | ツール呼び出し時のファイルI/Oを排除し高速化 |
| **Zod バリデーション** | docs-index.json の型安全性をランタイムで保証 |
| **全ツール読み取り専用** | 副作用なし。アノテーションで明示しクライアントに安全性を伝達 |
