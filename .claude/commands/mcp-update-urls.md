# MCP Server URL 更新（軽量版）

`packages/mcp/src/data/docs-index.json` の `sourcePath` と `category` のみを、実ファイルの移動に追従させて更新する軽量コマンド。
テキスト系フィールド（title, description, headings, keywords, snippet）は**変更しない**。

> **使い分け**:
> - 新規ページ追加・内容更新・テキスト系も一括再生成したい → `/mcp-update`
> - ファイル移動に追従して `sourcePath` / `category` だけ更新したい → このコマンド

## 作業手順

### 1. 事前情報の取得

- `git rev-parse --short HEAD` で現在のコミットハッシュを取得

### 2. 不整合エントリの検出

- `packages/mcp/src/data/docs-index.json` を読み込む
- 各エントリの `sourcePath` について、`apps/docs/src/content/ja/{sourcePath}` が実在するか確認
- 存在しないエントリを「移動候補」として抽出

### 3. 新パスの自動探索

各移動候補について、ファイル名（basename）で `apps/docs/src/content/ja/**/{basename}` を Glob 検索し、以下のように分岐する。

- **単一マッチ**: そのパスを新 `sourcePath` として採用
- **複数マッチ**: 候補をユーザーに提示して選択を仰ぐ
- **マッチなし**: 該当ファイルは削除された可能性があるため、ユーザーに報告する。自動では削除しない

### 4. 変更プランの提示

ユーザーに変更内容を提示して確認を取る。各エントリについて以下を表示:

- 旧 `sourcePath` → 新 `sourcePath`
- 旧 `category` → 新 `category`

### 5. エントリ更新

ユーザーから承認を得たら、以下の方針で `docs-index.json` を更新する:

- `sourcePath`: 新パスに置換
- `category`:
  - 新パスがディレクトリ配下の場合（例: `property-class/bd.mdx`）は**先頭ディレクトリ名**を採用（例: `"property-class"`）
  - 新パスが top-level（例: `overview.mdx`）の場合は**既存の category を維持**（top-level のカテゴリ付けは規則的に決まらないため）
- テキスト系フィールド（`title`, `description`, `headings`, `keywords`, `snippet`）は**変更しない**
- 配列の要素順序は維持すること

### 6. meta.ts の更新

`packages/mcp/src/data/meta.ts` を以下のように更新:

- `generatedAt`: 今日の日付（`YYYY-MM-DD`）
- `sourceCommit`: 手順 1 で取得した HEAD コミットハッシュ

### 7. 差分サマリーの報告

変更点のサマリーをユーザーに報告する。報告内容:

- 更新したエントリ数
- 旧 `sourcePath` / `category` → 新 `sourcePath` / `category` のリスト
- 「マッチなし」「複数マッチ」で保留したエントリがあれば明示

## 注意事項

- JSON の既存フィールドは、`sourcePath` と `category` 以外は変更しないこと
- 配列の要素順序は維持すること
- 削除されたページや新規追加されたページは扱わない（その場合は `/mcp-update` を使うこと）
- サブエージェントは起動せず、メインエージェントが直接処理する（軽量処理のため）
