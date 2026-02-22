# @lism-css/mcp-server

[Lism CSS](https://lism-ui.com) の [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) サーバーです。
AI ツール（Claude Code, Cursor 等）が Lism CSS の最新ドキュメント・API を正確に参照できるようにします。

## できること

| ツール | 説明 |
|--------|------|
| `get_overview` | フレームワークの全体像（アーキテクチャ、CSS Layers、パッケージ構成、インストール方法） |
| `get_tokens` | デザイントークン（色、余白、フォントサイズ、影、角丸など）の一覧・カテゴリ絞り込み |
| `get_props_system` | Props システム対応表（React props → CSS クラス/スタイルの変換ルール） |
| `get_component` | コンポーネント詳細（props、使い方、サブコンポーネント構成） |
| `search_docs` | ドキュメント全文検索（キーワードによるスコアリング付き） |

## 聞けること（例）

- 「Lism CSS の基本的なアーキテクチャを教えて」→ `get_overview`
- 「spacing トークンの一覧を見せて」→ `get_tokens(category: "spacing")`
- 「`p` や `fz` などの省略 props は何に対応している？」→ `get_props_system(prop: "p")`
- 「Accordion コンポーネントの使い方は？」→ `get_component(name: "Accordion")`
- 「レスポンシブ対応の方法を調べて」→ `search_docs(query: "レスポンシブ")`

## セットアップ

### Claude Code

```bash
claude mcp add lism-css -- npx -y @lism-css/mcp-server
```

### Cursor

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "lism-css": {
      "command": "npx",
      "args": ["-y", "@lism-css/mcp-server"]
    }
  }
}
```

### Windsurf

`.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "lism-css": {
      "command": "npx",
      "args": ["-y", "@lism-css/mcp-server"]
    }
  }
}
```

### VS Code (GitHub Copilot)

`.vscode/mcp.json`:

```json
{
  "servers": {
    "lism-css": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@lism-css/mcp-server"]
    }
  }
}
```
