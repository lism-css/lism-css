# MCP データ更新

MCP サーバーの `docs-index.json`（`packages/mcp/src/data/`）を最新ソースから再生成する。

> **注:** 参照系ツール（get_overview, get_tokens, get_props_system, get_component, get_guide）は
> `skills/lism-css-guide/*.md` を正本として Markdown を返却する構成になっています。
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
4. `packages/mcp` で `pnpm test` を実行し、`docs-index.test.ts` の構造検証（sourcePath の実在・収録漏れ・URL スラッグ変換の apps/docs との一致）が通ることを確認する
5. 変更点のサマリーを報告

> **注:** `docs-index.json` は 1 つの MDX ファイルに対して複数エントリ（セクション単位）を持てる。
> `sourcePath` の重複はエラーではなく、長いページを検索単位で分割するための意図的な設計。


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
