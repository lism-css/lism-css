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

| ツール名 | 用途 | 返却形式 | 入力例 |
|---------|------|---------|--------|
| `get_overview` | フレームワークの概要を取得 | Markdown | （引数なし） |
| `get_tokens` | デザイントークンを取得 | Markdown | （引数なし） |
| `get_props_system` | Props → CSS マッピングを参照 | Markdown | `prop: "p"` or `prop: "padding"` |
| `get_component` | コンポーネントの詳細を取得 | Markdown | `name: "Accordion"` |
| `get_guide` | 特定トピックのガイドを取得 | Markdown | `topic: "css-rules"` |
| `search_docs` | ドキュメントをキーワード検索 | JSON | `query: "レスポンシブ"` |
| `convert_css` | CSS を lism-css props に変換 | JSON | `css: "padding: 1rem;"` |


## ファイル構成

```
packages/mcp/
├── bin/
│   └── lism-mcp.mjs           # 実行エントリポイント
├── src/
│   ├── index.ts                # サーバー初期化・起動
│   ├── lib/
│   │   ├── load-data.ts        # JSON データ読み込み（docs-index.json のみ）
│   │   ├── load-markdown.ts    # Markdown ガイド読み込み・キャッシュ
│   │   ├── markdown-utils.ts   # Markdown パーサー（セクション抽出・テーブル解析）
│   │   ├── schemas.ts          # Zod スキーマ定義（DocsEntrySchema）
│   │   ├── search.ts           # ドキュメント検索ロジック
│   │   ├── response.ts         # レスポンスのフォーマット
│   │   └── types.ts            # TypeScript 型定義
│   ├── tools/
│   │   ├── get-overview.ts     # ツール: フレームワーク概要（SKILL.md ベース）
│   │   ├── get-tokens.ts       # ツール: デザイントークン（tokens.md）
│   │   ├── get-props-system.ts # ツール: Props システム（property-class.md）
│   │   ├── get-component.ts    # ツール: コンポーネント情報（components-*.md）
│   │   ├── get-guide.ts        # ツール: 汎用ガイド取得
│   │   ├── search-docs.ts      # ツール: ドキュメント検索
│   │   └── convert-css.ts      # ツール: CSS → lism-css 変換
│   ├── data/
│   │   ├── meta.ts             # メタ情報（生成日時等）
│   │   └── docs-index.json     # ドキュメント検索インデックス
│   └── tests/
│       ├── search.test.ts
│       ├── tools.test.ts
│       └── convert-css.test.ts
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```


## データソースと生成フロー

### Skill-First アーキテクチャ

```
① パッケージソース（最上位の事実）
   packages/lism-css/, packages/lism-ui/
        │
        │  手動で整理（/update-skill-template コマンド）
        ▼
② .claude/skills/lism-css-guide/*.md（正本）
        │
        ├─ load-markdown.ts が直接参照（開発・テスト時）
        │
        └─ pnpm build（cp）→ dist/data/guides/*.md（npm 配布時）
```

参照系ツール（get_overview, get_tokens, get_props_system, get_component, get_guide）は **Markdown を直接返却**します。

### docs-index.json

ドキュメント検索インデックス（`search_docs` 用）は Markdown では代替不可のため、JSON として維持しています。`/mcp-update` コマンドで更新します。


## 処理の流れ

### 1. サーバー起動

```
bin/lism-mcp.mjs
  └─► dist/index.js
        │
        ├─ 1) preloadAll()     ← docs-index.json をメモリに読み込み
        ├─ 2) preloadGuides()  ← guides/*.md をメモリに読み込み
        ├─ 3) new McpServer()  ← MCPサーバーインスタンス生成
        ├─ 4) register*()      ← 7つのツールを登録
        └─ 5) server.connect() ← 標準入出力で待ち受け開始
```

### 2. ツール呼び出し

```
クライアント: get_tokens({})
      │
      ▼
  ツールハンドラ実行
      │
      ├─ loadMarkdown('tokens.md')  ← キャッシュからメモリ取得
      │
      └─► markdownResponse(content)  ← Markdown レスポンスを返却
```

### 3. レスポンスの形式

| 形式 | 対象ツール |
|------|----------|
| **Markdown** | get_overview, get_tokens, get_props_system, get_component, get_guide |
| **JSON** | search_docs, convert_css |


## ツール登録の仕組み

各ツールは `server.registerTool()` で登録します。

```typescript
server.registerTool(
    'get_tokens',
    {
        description: 'Get design tokens...',
        annotations: READ_ONLY_ANNOTATIONS,
    },
    () => markdownResponse(loadMarkdown('tokens.md'))
);
```

全ツールは読み取り専用（`readOnlyHint: true`）です。


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
pnpm build    # generate:ai-assets + TypeScript コンパイル + データコピー
pnpm test     # テスト実行
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
