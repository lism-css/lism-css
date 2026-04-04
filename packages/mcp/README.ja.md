# @lism-css/mcp

[English](./README.md) | [日本語](./README.ja.md)

[Lism CSS](https://lism-css.com) の [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) サーバーです。
AI ツール（Claude Code, Cursor 等）が Lism CSS の最新ドキュメント・API を正確に参照できるようにします。

## 利用可能なツール

| ツール | 説明 |
|--------|------|
| `get_overview` | フレームワークの全体像（アーキテクチャ、設計思想、パッケージ構成、ブレークポイント、インストール方法、CSS Layers） |
| `get_tokens` | デザイントークン（色、余白、フォントサイズ、影、角丸など）の一覧・カテゴリ絞り込み |
| `get_props_system` | Props システム対応表 — React/Astro の props が CSS クラス・スタイルにどう変換されるか。CSS プロパティ名での逆引き（例: `padding` → `p`）や Prop Class 記法（`-g:5` 等）にも対応 |
| `get_component` | コンポーネント詳細（props、使用例、サブコンポーネント構成）。パッケージ（`lism-css` / `@lism-css/ui`）での絞り込みも可能 |
| `search_docs` | ドキュメント全文検索（スコアリング付き）。カテゴリ絞り込みや CSS プロパティ名の自動展開に対応 |
| `convert_css` | CSS コードを Lism CSS の props・コンポーネントに変換。既存 CSS から Lism CSS への移行に便利 |

## 聞けること（例）

- 「Lism CSS の基本的なアーキテクチャを教えて」→ `get_overview`
- 「spacing トークンの一覧を見せて」→ `get_tokens(category: "spacing")`
- 「`p` や `fz` などの省略 props は何に対応している？」→ `get_props_system(prop: "p")`
- 「`-g:5` ってどういうクラス？」→ `get_props_system(prop: "-g:5")`
- 「`fz` に対応する CSS プロパティは？」→ `get_props_system(prop: "font-size")`
- 「Accordion コンポーネントの使い方は？」→ `get_component(name: "Accordion")`
- 「UI コンポーネントだけ見たい」→ `get_component(name: "Accordion", package: "@lism-css/ui")`
- 「レスポンシブ対応の方法を調べて」→ `search_docs(query: "レスポンシブ")`
- 「ガイドだけ検索」→ `search_docs(query: "レスポンシブ", category: "guide")`
- 「`display: flex; gap: 1rem;` を Lism に変換して」→ `convert_css(css: "display: flex; gap: 1rem;")`

## セットアップ

### Claude Code

```bash
claude mcp add lism-css -- npx -y @lism-css/mcp
```

### Cursor

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "lism-css": {
      "command": "npx",
      "args": ["-y", "@lism-css/mcp"]
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
      "args": ["-y", "@lism-css/mcp"]
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
      "args": ["-y", "@lism-css/mcp"]
    }
  }
}
```
