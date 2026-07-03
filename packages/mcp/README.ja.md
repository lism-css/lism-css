# @lism-css/mcp

[English](./README.md) | [日本語](./README.ja.md)

[Lism CSS](https://lism-css.com) の [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) サーバーです。
AIツール（Claude Code, Cursor 等）が、インストールされているこのパッケージのバージョンに対応したLism CSSのドキュメント・APIを正確に参照できるようにします。

## 利用可能なツール

| ツール | 説明 |
|--------|------|
| `get_overview` | フレームワークの全体像（アーキテクチャ、設計思想、パッケージ構成、ブレークポイント、CSS Layers、実装ルール） |
| `get_tokens` | デザイントークン（色、余白、フォントサイズ、影、角丸など）のリファレンス全文を取得 |
| `get_props_system` | Propsシステム対応表 — React/Astro のpropsがCSSクラス・スタイルにどう変換されるか。CSSプロパティ名での逆引き（例: `padding` → `p`）や Property Class 記法（`-g:5` 等）にも対応 |
| `get_component` | コンポーネント詳細（props、使用例、サブコンポーネント構成）。パッケージ（`lism-css` / `@lism-css/ui`）での絞り込みも可能 |
| `get_guide` | 特定トピックの詳細ガイド（CSSルール、レスポンシブ、ユーティリティクラス、プリミティブ / Traitクラス、セットクラス、ベーススタイル、命名規則、カスタマイズなど） |
| `search_docs` | ドキュメント全文検索（スコアリング付き）。カテゴリ絞り込みやCSSプロパティ名の自動展開に対応 |
| `convert_css` | CSSコードをLism CSSのprops・コンポーネントに変換。既存CSSからLism CSSへの移行に便利 |

## 聞けること（例）

- 「Lism CSSの基本的なアーキテクチャを教えて」→ `get_overview`
- 「spacingトークンの一覧を見せて」→ `get_tokens()`
- 「`p` や `fz` などの省略propsは何に対応している？」→ `get_props_system(prop: "p")`
- 「`-g:5` ってどういうクラス？」→ `get_props_system(prop: "-g:5")`
- 「`fz` に対応するCSSプロパティは？」→ `get_props_system(prop: "font-size")`
- 「Accordionコンポーネントの使い方は？」→ `get_component(name: "Accordion")`
- 「UIコンポーネントだけ見たい」→ `get_component(name: "Accordion", package: "@lism-css/ui")`
- 「CSSレイヤー構造を教えて」→ `get_guide(topic: "css-rules")`
- 「レスポンシブ対応の方法を教えて」→ `get_guide(topic: "responsive")`
- 「ガイドだけ検索」→ `search_docs(query: "レスポンシブ", category: "guide")`
- 「`display: flex; gap: 1rem;` をLismに変換して」→ `convert_css(css: "display: flex; gap: 1rem;")`

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
