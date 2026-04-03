# llms.txt Update

`apps/docs/public/llms.txt` を英語ドキュメントの最新状態に合わせて更新する。


## 概要

`llms.txt` は LLM 向けにドキュメントサイトの構造化されたページ一覧を提供するファイル。
英語ドキュメント（`apps/docs/src/content/en/`）の MDX ファイルを正とし、最新の状態に再生成する。


## 作業手順

### 1. 現在の llms.txt を読み込む

`apps/docs/public/llms.txt` を読み取り、ヘッダー部分のフォーマット（タイトル・説明文・GitHub/npm/License 情報）を把握する。

### 2. 英語ドキュメントのファイル一覧を取得

`apps/docs/src/content/en/**/*.mdx` から全ファイルを取得し、各ファイルのフロントマター（`title`, `description`）を読み取る。

以下は除外する：
- `test.mdx`
- `_demo/` 配下

### 3. セクションへの分類

ファイルパスに基づいて以下のセクションに分類する。

| セクション | 対象ファイル | 備考 |
|---|---|---|
| Getting Started | `overview.mdx`, `installation.mdx`, `changelog.mdx` | |
| Core Concepts | `css-methodology.mdx`, `tokens.mdx`, `typography.mdx`, `base-styles.mdx`, `reset-css.mdx`, `responsive.mdx`, `customize.mdx` | |
| CSS Classes | `set-class.mdx`, `module-class.mdx`, `utility-class.mdx`, `prop-class.mdx` | |
| Core Components | `core-components/*.mdx`（`Media.mdx` を除く） | |
| State Modules | `modules/is--*.mdx` | |
| Layout Modules | `modules/l--*.mdx` | |
| Atomic Modules | `modules/a--*.mdx` + `core-components/Media.mdx` | Media はファイルパスは core-components だがこのセクションに配置 |
| UI Components | `ui/*.mdx`（`examples/` 配下・`DummyText.mdx`・`DummyImage.mdx` を除く） | |
| Optional | `ui/examples/*.mdx`, `props/*.mdx`, `ui/DummyText.mdx`, `ui/DummyImage.mdx` | |

**どのセクションにも該当しないファイルがあれば、ユーザーに報告して配置を確認する。**

### 4. URL の生成

ファイルパスから URL を生成する。ルールは以下の通り：

| ファイルパス | URL パターン |
|---|---|
| `ui/**/*.mdx` | `https://www.lism-css.com/en/ui/{ui以下のパス}/` |
| それ以外 | `https://www.lism-css.com/en/docs/{パス}/` |

パスは拡張子 `.mdx` を除いたもの（例: `modules/l--flex.mdx` → `modules/l--flex`）。

### 5. llms.txt の生成

現在の llms.txt のヘッダー部分（`# Lism CSS` 〜 `- License: MIT` まで）は維持し、セクション以下を再生成する。

各エントリのフォーマット:
```
- [Title](URL): Description
```

- `description` はフロントマターの値をそのまま使用する
- セクション内の並び順は、上記テーブルの「対象ファイル」の記載順を基本とする。特に明示がないセクション（Core Components 等）はアルファベット順
- セクション間は空行で区切る

### 6. 差分の報告

更新が完了したら、以下をユーザーに報告する：
- 追加されたページ（新規）
- 削除されたページ（ドキュメントが消えたもの）
- description が変更されたページ
- セクション分類できなかったファイルがあればその旨


## 注意事項

- フロントマターの情報のみを使用し、MDX の本文は読み込まない
- フロントマターに存在しない情報を推測で追加しない
- ヘッダー部分の説明文や npm パッケージ情報を変更する場合はユーザーに確認する
