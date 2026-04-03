# MCP データ更新

MCP サーバーの JSON データ（`packages/mcp/src/data/`）を最新ソースから再生成する。


## コマンド

```
/mcp-update
```

引数なし。全 JSON を一括更新する。


## 処理フロー

1. バージョン情報・コミットハッシュを取得
2. `lism-mcp-editor` サブエージェント（sonnet）を 3 並列で起動
3. 完了後 `meta.ts` の `generatedAt` / `sourceCommit` を更新
4. 変更点のサマリーを報告


## 並列グループと対象ファイル

| グループ | JSON ファイル | 主な参照ソース |
|----------|-------------|---------------|
| A | `overview.json`, `tokens.json` | `package.json`, `scss/token/` |
| B | `props-system.json`, `components.json` | `src/config/`, `src/components/`, `config/defaults/` |
| C | `docs-index.json` | `apps/docs/src/content/ja/**/*.mdx` |


## 情報の優先順位

1. **パッケージソース**（`packages/lism-css/`, `packages/lism-ui/`）が常に正
2. **ドキュメント**（`apps/docs/`）は補足。ソースと矛盾する場合はソースを優先


## 関連ファイル

- コマンド定義: `.claude/commands/mcp-update.md`
- サブエージェント: `.claude/agents/lism-mcp-editor.md`
- データ出力先: `packages/mcp/src/data/`
- メタ情報: `packages/mcp/src/data/meta.ts`
