# MCP サーバー アーキテクチャガイド

このドキュメントでは、`@lism-css/mcp-server` パッケージの全体像と処理の流れを、MCPサーバー構築の初心者にも分かるように解説します。


## MCP とは

**MCP（Model Context Protocol）** は、AI アシスタント（Claude など）が**外部のデータやツールにアクセスするための標準プロトコル**です。

通常、AI は学習済みの知識しか持っていませんが、MCP を使うと「最新のドキュメント」「プロジェクト固有のAPI情報」などを**リアルタイムにAIへ提供**できます。

```
┌───────────────────┐         MCP プロトコル         ┌──────────────────┐
│   MCP クライアント │  ◄───── JSON-RPC 通信 ─────►  │   MCP サーバー    │
│  (Claude Code等)  │         (標準入出力)           │ (このパッケージ)  │
└───────────────────┘                                └──────────────────┘
       │                                                     │
  AI がツールを                                        ツールを実行し
  呼び出す                                             結果を返す
```

### 仕組みのポイント

- **クライアント**: Claude Code などの AI アシスタント。ユーザーの質問に応じてツールを選択・呼び出す
- **サーバー**: ツール（機能）を提供する側。このパッケージがそれにあたる
- **通信方式**: 標準入出力（stdin/stdout）を使った JSON-RPC。HTTP サーバーは不要


## Stdio トランスポートの仕組み

「サーバー」という名前ですが、HTTP サーバーのように**常駐させる必要はありません**。

このサーバーは **Stdio（標準入出力）方式** を採用しており、**クライアント（Claude Code等）が子プロセスとして自動で起動・終了**します。

```
1. ユーザーが Claude Code を起動
2. Claude Code が設定ファイルを読む
3. Claude Code が自動で node bin/lism-mcp.mjs を子プロセスとして起動
4. stdin/stdout でやりとり
5. Claude Code を終了 → 子プロセスも終了
```

MCP にはもう1つ **HTTP (SSE) 方式** もありますが、そちらはリモートやチーム共有向けで、自分でサーバーを常駐させる必要があります。ローカルで使う前提なら Stdio が最もシンプルです。

| | Stdio（このサーバー） | HTTP (SSE) |
|---|---|---|
| 起動 | クライアントが自動起動 | 自分で常駐させる |
| ネットワーク | 不要（ローカル通信） | 必要 |
| 設定 | コマンドパスを指定するだけ | URLを指定 |


## このMCPサーバーの役割

Lism CSS のドキュメント・API情報を、AI が正確に参照できるようにするためのサーバーです。

AI が Lism CSS を使ったコードを生成する際に、**古い知識や推測ではなく、最新のソースから生成されたデータ**を参照できるようになります。

### 提供するツール（5つ）

| ツール名 | 用途 | 入力例 |
|---------|------|--------|
| `get_overview` | フレームワークの概要を取得 | （引数なし） |
| `get_tokens` | デザイントークンを取得 | `category: "spacing"` |
| `get_props_system` | Props → CSS マッピングを参照 | `prop: "p"` |
| `get_component` | コンポーネントの詳細を取得 | `name: "Accordion"` |
| `search_docs` | ドキュメントをキーワード検索 | `query: "レスポンシブ"` |


## ファイル構成

```
packages/mcp-server/
├── bin/
│   └── lism-mcp.mjs           # 実行エントリポイント
├── src/
│   ├── index.ts                # サーバー初期化・起動
│   ├── lib/
│   │   ├── load-data.ts        # データ読み込み・キャッシュ
│   │   ├── schemas.ts          # Zod スキーマ定義
│   │   ├── search.ts           # ドキュメント検索ロジック
│   │   ├── response.ts         # レスポンスのフォーマット
│   │   └── types.ts            # TypeScript 型定義
│   ├── tools/
│   │   ├── get-overview.ts     # ツール: フレームワーク概要
│   │   ├── get-tokens.ts       # ツール: デザイントークン
│   │   ├── get-props-system.ts # ツール: Props システム
│   │   ├── get-component.ts    # ツール: コンポーネント情報
│   │   └── search-docs.ts      # ツール: ドキュメント検索
│   ├── data/
│   │   ├── meta.ts             # メタ情報（生成日時等）
│   │   ├── overview.json       # フレームワーク概要データ
│   │   ├── tokens.json         # デザイントークン定義
│   │   ├── props-system.json   # Props システムデータ
│   │   ├── components.json     # コンポーネント定義
│   │   └── docs-index.json     # ドキュメント検索インデックス
│   └── tests/
│       ├── search.test.ts      # 検索ロジックのユニットテスト
│       └── tools.test.ts       # ツール統合テスト
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```


## 処理の流れ

### 1. サーバー起動

```
$ node bin/lism-mcp.mjs
```

`bin/lism-mcp.mjs` が `dist/index.js`（TypeScript コンパイル済み）を呼び出し、以下の順序で初期化が進みます。

```
bin/lism-mcp.mjs
  └─► dist/index.js (= src/index.ts のコンパイル結果)
        │
        ├─ 1) preloadAll()     ← 全データを一括読み込み
        ├─ 2) new McpServer()  ← MCPサーバーインスタンス生成
        ├─ 3) register*()      ← 5つのツールを登録
        └─ 4) server.connect() ← 標準入出力で待ち受け開始
```

**ソースコード（src/index.ts）:**

```typescript
async function main() {
    // 1) 起動時に全JSONデータをメモリへ読み込み
    preloadAll();

    // 2) MCPサーバーを初期化
    const server = new McpServer({
        name: 'lism-css',
        version: '0.1.0',
    });

    // 3) 5つのツールを登録
    registerGetOverview(server);
    registerGetTokens(server);
    registerGetPropsSystem(server);
    registerGetComponent(server);
    registerSearchDocs(server);

    // 4) 標準入出力でクライアントと接続
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
```

### 2. データのプリロード

サーバー起動時に `preloadAll()` で全JSONファイルを一括読み込みし、メモリにキャッシュします。

```
preloadAll()
  │
  ├─► overview.json      ─┐
  ├─► tokens.json         │  readFileSync() で読み込み
  ├─► props-system.json   ├─► JSON.parse() → Zod で検証 → Map にキャッシュ
  ├─► components.json     │
  └─► docs-index.json    ─┘
```

**なぜ起動時に全部読むのか？**
ツール呼び出し時にファイルI/Oが発生すると応答が遅くなります。起動時にまとめて読み込んでおくことで、ツール実行時は常にメモリから高速に取得できます。

**ソースコード（src/lib/load-data.ts）:**

```typescript
// メモリキャッシュ
const cache = new Map<string, unknown>();

export function loadJSON<T>(filename: string, schema: ZodType<T>): T {
    // キャッシュにあればそのまま返す
    if (cache.has(filename)) return cache.get(filename) as T;

    // ファイルから読み込み → JSON パース → Zod で型検証
    const raw = readFileSync(filePath, 'utf-8');
    const data = schema.parse(JSON.parse(raw));

    // キャッシュに保存
    cache.set(filename, data);
    return data;
}
```

Zod スキーマによる検証を挟むことで、JSONデータが期待する型構造と一致しない場合は**起動時にエラーで即座に検出**できます。

### 3. ツール呼び出し（リクエスト → レスポンス）

クライアント（Claude Code等）がツールを呼び出すと、以下の流れで処理されます。

```
┌─────────────┐      JSON-RPC       ┌──────────────────────────────────────┐
│ Claude Code │  ──── stdin ────►   │ MCP サーバー                         │
│             │                     │                                      │
│ 「spacing   │                     │  1) リクエストを受信                  │
│  トークンの │                     │  2) 該当ツールのハンドラを実行        │
│  一覧は？」 │                     │  3) キャッシュからデータ取得          │
│             │                     │  4) フィルタリング・加工              │
│             │  ◄── stdout ────   │  5) JSON/Markdown でレスポンスを返却  │
│             │                     │                                      │
│ 結果を受け  │                     └──────────────────────────────────────┘
│ 取って回答  │
└─────────────┘
```

#### 具体例: `get_tokens` ツールの場合

```
クライアント: get_tokens({ category: "spacing" })
      │
      ▼
  ツールハンドラ実行
      │
      ├─ loadJSON('tokens.json')    ← キャッシュからメモリ取得（ファイルI/O なし）
      │
      ├─ category でフィルタリング   ← "spacing" に一致するカテゴリだけ抽出
      │
      └─► success({ tokens: [...] })  ← JSON レスポンスを返却
```

#### 具体例: `search_docs` ツールの場合

```
クライアント: search_docs({ query: "レスポンシブ", limit: 5 })
      │
      ▼
  ツールハンドラ実行
      │
      ├─ loadJSON('docs-index.json')  ← キャッシュからメモリ取得
      │
      ├─ searchDocs() 実行
      │    ├─ クエリをトークン化       ← "レスポンシブ" → ["レスポンシブ"]
      │    ├─ 各ドキュメントをスコアリング
      │    │    ├─ title に一致:       +10点
      │    │    ├─ keywords に一致:     +5点
      │    │    ├─ headings に一致:     +3点
      │    │    ├─ description に一致:  +2点
      │    │    └─ snippet に一致:      +1点
      │    ├─ スコア降順でソート
      │    └─ 上位5件を返却
      │
      └─► success({ query, results: [...] })
```


### 4. レスポンスの形式

ツールの種類によって、2つのレスポンス形式があります。

**JSON 形式**（get_tokens, get_props_system, get_component, search_docs）:

```json
{
  "meta": {
    "generatedAt": "2026-02-25",
    "sourceCommit": "c482377a",
    "docsVersion": "0.1.0"
  },
  "tokens": [ ... ]
}
```

**Markdown 形式**（get_overview）:

```markdown
# lism-css Overview

> Generated at: 2026-02-25 | Source commit: c482377a

## Description
Lism CSS は...
```

全ツールに `meta` 情報が付与されるため、クライアント側でデータの鮮度を判断できます。


## ツール登録の仕組み

各ツールは `server.registerTool()` で登録します。これは MCP SDK が提供するメソッドで、ツール名・設定オブジェクト・ハンドラの3引数を指定します。

```typescript
server.registerTool(
    'get_tokens',                          // (1) ツール名
    {
        description: 'Get design tokens...', // (2) ツールの説明（AI が選択判断に使う）
        inputSchema: {                       // (3) 入力パラメータの Zod スキーマ
            category: z.enum([...]),
        },
        annotations: READ_ONLY_ANNOTATIONS,  // (4) アノテーション（読み取り専用等）
    },
    ({ category }) => { ... }              // (5) ハンドラ関数
);
```

| 引数 | 役割 |
|------|------|
| ツール名 | クライアントがツールを指定する際の識別子 |
| 設定オブジェクト | `description`（説明文）、`inputSchema`（Zodスキーマ）、`annotations`（読み取り専用等）をまとめて指定 |
| ハンドラ | 実際の処理ロジック |

> **Note:** SDK v1.26.0 以前は `server.tool()` で個別の引数として渡す旧 API が使われていましたが、現在は非推奨です。


## データの管理

### データソースと生成フロー

```
リポジトリのソースコード
  │
  ├─ packages/lism-css/   (CSS・コンポーネント定義)
  ├─ packages/lism-ui/    (UIコンポーネント)
  └─ apps/docs/           (MDX ドキュメント)
         │
         │  手動で /mcp-update コマンドを実行
         ▼
  packages/mcp-server/src/data/*.json
         │
         │  pnpm build (tsc + cp)
         ▼
  packages/mcp-server/dist/data/*.json  ← サーバーが参照
```

`data/` 配下の JSON は**リポジトリのソースコードから手動で再生成**するものです。自動生成スクリプトではなく、ソースを読み取って Claude Code 等が `/mcp-update` コマンドで更新します。

### データファイル一覧

| ファイル | 内容 | データ元 |
|---------|------|----------|
| `overview.json` | フレームワーク概要、CSS Layer、インストール手順 | overview.mdx, installation.mdx 等 |
| `tokens.json` | デザイントークン（色、余白、フォントサイズ等） | SCSS トークンファイル |
| `props-system.json` | Props → CSSプロパティのマッピング | config/defaults/props.ts |
| `components.json` | 全コンポーネントの名前・props・使用例 | コンポーネントソースと MDX |
| `docs-index.json` | ドキュメント検索用インデックス | apps/docs/ 配下の全 MDX |
| `meta.ts` | 生成日時とソースコミットハッシュ | git HEAD |


## 使い方

### Claude Code での設定

`claude_desktop_config.json`（または `.claude.json` の `mcpServers`）に以下を追加します。

```json
{
  "mcpServers": {
    "lism-css": {
      "command": "node",
      "args": ["/path/to/packages/mcp-server/bin/lism-mcp.mjs"]
    }
  }
}
```

設定後、Claude Code を再起動すると `get_overview`, `get_tokens` 等のツールが使えるようになります。

### npm パッケージとして公開した場合

```json
{
  "mcpServers": {
    "lism-css": {
      "command": "npx",
      "args": ["@lism-css/mcp-server"]
    }
  }
}
```

### 開発

```bash
cd packages/mcp-server

pnpm build    # TypeScript コンパイル + JSON コピー
pnpm test     # テスト実行
pnpm dev      # TypeScript ウォッチモード
```


## 設計判断のまとめ

| 設計 | 理由 |
|------|------|
| **Stdio トランスポート** | HTTP サーバー不要。プロセス起動するだけで動く |
| **起動時プリロード** | ツール呼び出し時のファイルI/Oを排除し高速化 |
| **Zod バリデーション** | JSONデータの型安全性をランタイムで保証 |
| **全ツール読み取り専用** | 副作用なし。アノテーションで明示しクライアントに安全性を伝達 |
| **静的JSONデータ** | APIやDB不要。ファイルだけで完結するシンプルな構成 |
| **スコアリング検索** | title > keywords > headings > description > snippet の重み付けで関連度の高い結果を返す |
