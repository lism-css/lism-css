---
description: MCP の docs-index.json を apps/docs の日本語 MDX 全件と照合し、既存エントリの内容も含めて更新する。ファイル構成の差分だけなら /mcp-update-urls
---

# MCP Server データ更新

`packages/mcp/src/data/docs-index.json` を `apps/docs/src/content/ja/` の MDX 全件と照合して更新する。エントリのルール・除外対象は `.claude/agents/lism-mcp-editor.md` が正本。参照系ツール（get_overview 等）の正本は `skills/lism-css-guide/` で、その更新は `/update-skills`。


## 手順

1. `git rev-parse --short HEAD` でコミットハッシュを取る
2. `lism-mcp-editor` サブエージェントを 1 体起動し、「`docs-index.json` を `ja/` 全件と照合して更新する。削除候補は削除せず報告する」と伝える
3. `packages/mcp/src/data/meta.ts` の `generatedAt` を今日（`YYYY-MM-DD`）、`sourceCommit` を手順 1 のハッシュにする。`docsVersion` は触らない
4. `nr -C packages/mcp test` を実行し（`runner` に任せてよい）、`docs-index.test.ts`（sourcePath の実在・収録漏れ・URL スラッグ）を通す。失敗したら原因を直してから進む
5. 差分サマリーを報告する。削除候補は一覧で提示し、ユーザーの承認を得てから削除する


## ルール

- 既存フィールドは削除指示がない限り保持する
- エントリの削除は必ずユーザーの承認後
