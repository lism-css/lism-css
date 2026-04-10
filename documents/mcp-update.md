# MCP データ更新

MCP サーバーの `docs-index.json`（`packages/mcp/src/data/`）を最新ソースから再生成する。

> **注:** 参照系ツール（get_overview, get_tokens, get_props_system, get_component, get_guide）は
> `.claude/skills/lism-css-guide/*.md` を正本として Markdown を返却する構成になっています。
> スキルファイルの更新は `/update-skill-template` コマンドで行います。
> このコマンドでは `docs-index.json` のみを更新対象とします。


## コマンド

```
/mcp-update
```

引数なし。`docs-index.json` を更新する。


## 処理フロー

1. バージョン情報・コミットハッシュを取得
2. `lism-mcp-editor` サブエージェント（sonnet）を 1 並列で起動
3. 完了後 `meta.ts` の `generatedAt` / `sourceCommit` を更新
4. 変更点のサマリーを報告


## 対象ファイル

| JSON ファイル | 用途 | 主な参照ソース |
|-------------|------|---------------|
| `docs-index.json` | `search_docs` ツール用の検索インデックス | `apps/docs/src/content/ja/**/*.mdx` |


## 情報の優先順位

1. **パッケージソース**（`packages/lism-css/`, `packages/lism-ui/`）が常に正
2. **ドキュメント**（`apps/docs/`）は補足。ソースと矛盾する場合はソースを優先


## 関連ファイル

- コマンド定義: `.claude/commands/mcp-update.md`
- サブエージェント: `.claude/agents/lism-mcp-editor.md`
- データ出力先: `packages/mcp/src/data/`
- メタ情報: `packages/mcp/src/data/meta.ts`
