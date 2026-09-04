---
description: MCP の docs-index.json をファイル構成の差分（移動・リネーム・新規・削除）だけに追従させる軽量版。既存エントリの文言は変えない。内容も更新するなら /mcp-update
---

# MCP Server URL / 構成更新（軽量版）

`packages/mcp/src/data/docs-index.json` の `sourcePath`・`category` を `apps/docs/src/content/ja/` の実ファイル構成に合わせる。既存エントリの `title`・`description`・`headings`・`keywords`・`snippet` は移動・リネーム時も変えない。新規エントリだけ生成する。

メインエージェントが直接処理する（サブエージェントは手順 9 の `runner` だけ可）。`en/` は参照しない。


## 手順

1. `git rev-parse --short HEAD` でコミットハッシュを取る
2. 実在ファイル集合を作る: `apps/docs/src/content/ja/**/*.mdx` を Glob し、`_` 始まりのファイル・ディレクトリと `test.mdx`（この名前だけ）を除く（定義は `packages/mcp/src/tests/docs-index.test.ts` の `listIndexableMdxFiles` が正）。パスは `ja/` からの相対
3. `docs-index.json` の各エントリを分類する
   - 一致: 実ファイルあり。同一 `sourcePath` の分割エントリは 1 つでもあれば全て一致
   - 不一致: 実ファイルなし → 手順 4
   - 未登録: 実在ファイル集合にあるが `sourcePath` に無い → 手順 5
4. 不一致エントリごとに basename で `apps/docs/src/content/ja/**/{basename}` を Glob する
   - 単一マッチ: 移動候補。そのパスを新 `sourcePath` にする
   - 複数マッチ: 保留。手順 6 でユーザーに選んでもらう
   - マッチなし: 未登録ファイルの frontmatter（`title`・`description`）とエントリの `title` 等を突き合わせ、同一ページならリネーム候補（そのパスを新 `sourcePath` にし、その未登録ファイルは手順 5 から外す）。対応が無いものだけ削除候補
   - 同一 `sourcePath` の分割エントリは 1 グループとして同じ判定を適用する（分割エントリの `title` はセクション名なので frontmatter と一致しなくてよい）
5. 未登録ファイル（手順 4 でリネームに対応付いたものを除く）の新規エントリを `.claude/agents/lism-mcp-editor.md` の「フィールドのルール」で生成する。挿入位置は同じ category・ディレクトリの既存エントリの直後
6. 変更プランを提示し、承認を得る
   - 移動・リネーム: 旧 → 新の `sourcePath`・`category`（リネームは明記）
   - 追加: `sourcePath`・`category`・`title`（詳細は必要なら折りたたむ）
   - 削除: `sourcePath`・`title`
   - 保留: 複数マッチ
7. 承認後に `docs-index.json` を更新する。移動・リネームは `sourcePath` と、新パスから手順 5 のルールで導いた `category` だけ置換。追加は手順 5 の位置に挿入、削除は配列から除去。要素順は可能な限り維持
8. `packages/mcp/src/data/meta.ts` の `generatedAt` を今日（`YYYY-MM-DD`）、`sourceCommit` を手順 1 のハッシュにする。`docsVersion` は触らない
9. `nr -C packages/mcp test` を実行し、`docs-index.test.ts`（sourcePath の実在・収録漏れ・URL スラッグ）を通す。失敗したら原因を直してから進む
10. 報告する: 移動・リネーム件数と旧 → 新、追加件数と `sourcePath`・`title`、削除件数と `sourcePath`・`title`、保留があれば明記
