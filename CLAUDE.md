# CLAUDE.md


## 動作ルール
- 会話・質問は全てこのプロジェクトに関することです。その前提で回答してください
- 実装・設計・ファイル変更を伴う作業を勝手に行わないこと。ユーザーがタスク実装コマンドやスキルを提示するか、または明示的に実装許可を出すまで待って下さい。
- 質問への回答や簡単な説明は即座に対応して構いません。


## プロジェクト概要

Lism CSS は軽量な CSS設計フレームワーク。レイアウトプリミティブ、ユーティリティクラス、デザイントークン等を CSSレイヤー構造で提供し、React / Astro コンポーネントも同梱している。

pnpm workspaces と Turbo を使用したモノレポ構造。lint 系設定ファイルはルート直下に配置。


### packages（npm 公開）
- `packages/lism-css/`: コア CSS + React / Astro レイアウトコンポーネント — [CLAUDE.md](packages/lism-css/CLAUDE.md)
- `packages/lism-ui/`: インタラクティブ UI コンポーネント（Accordion, Modal, Tabs 等）— [CLAUDE.md](packages/lism-ui/CLAUDE.md)
- `packages/lism-cli/`: `lism-cli` コマンド本体（`create` / `ui` / `skill` サブコマンド）
- `packages/create-lism/`: `pnpm create lism` 規約のラッパー（`lism-cli` を bundle で内包）
- `packages/mcp/`: AI コーディングツール向け MCP サーバー

### apps
- `apps/docs/`: Astro ベースのドキュメントサイト — [CLAUDE.md](apps/docs/CLAUDE.md)
- `apps/catalog/`: コンポーネントカタログ

### その他のディレクトリ
- `skills/lism-css-guide/`: `lism-cli skill add` および skills.sh の配信元
- `templates/`: `lism-cli create` のテンプレート（`package.json` に `"private": true` 必須）
- `documents/`: 運営者向けの運用ノート（CLI ガイド・docs 更新手順 等）

各ワークスペースの詳細な実装やアーキテクチャについては、それぞれの CLAUDE.md や README.md を参照。


## Git / PR 運用

- デフォルトの作業ブランチは `dev`（`main` ではない）
- 新しいブランチを作成する際は、必ず `dev` から切ること（`main` から切らない）
- プルリクエストのターゲットブランチも `dev`

## 公開情報の取り扱い（OSS）

このリポジトリはOSSとして公開されている。GitHubへ書き込む内容（issue・PR・コミットメッセージ・コードコメント・ドキュメント）に、以下のプライベート情報を含めないこと。

- ローカル環境の絶対パス（`/Users/...`などユーザー名を含むパス）
- メールアドレス・氏名などの個人情報
- このリポジトリと無関係な他プロジェクト名・顧客名・業務情報
- APIキー・トークン・環境変数の値などの秘密情報

エラーログやコマンド出力を引用する際は、上記を相対パス等に置換・マスクしてから貼り付ける。会話の文脈やグローバル設定・メモリから得た情報も、明示的な指示がない限り投稿文に含めない。issue・PR作成後は本文を表示して漏洩がないか確認すること。

## 主要コマンド


```bash
nr dev:docs # ドキュメントサイトlocalhostの立ち上げ
nr build  # 全ワークスペースを Turbo でビルド
nr build:core # packages/lism-css のみビルド
nr build:ui # packages/lism-ui のみビルド
nr build:cli # packages/lism-cli + packages/create-lism をビルド（^build 依存で順序保証）
nr build:docs # apps/docs のみビルド
nr lint # lintの実行
nr typecheck #typescript チェック
nr test #テスト
```


## 公式ドキュメントサイトの URL

ルート言語は日本語のため、URL は以下の通り：

- 日本語: `https://lism-css.com/`（`/ja/` プレフィックスは付けない）
- 英語: `https://lism-css.com/en/`

README やドキュメント等で公式サイトへのリンクを記載する際は、対象言語に応じて正しいパスを使うこと。


## 注意事項

- `lism-css-guide` スキルに関しては、`lism-css`パッケージ本体を編集中の場合は明示的に指示がない限り読み込まないこと。
- ただし、`templates/*`の編集時は、`lism-css-guide` スキルを読み込んでから作業すること。
- `templates/*` を新規追加する際は、`package.json` に `"private": true` を必ず付与すること（npm への誤公開防止）。
- `.claude/skills/` にローカルスキルを新規作成する際は、SKILL.md の frontmatter に `metadata.internal: true` を必ず付与すること（`npx skills add lism-css/lism-css` の配布対象から除外するため。配布用スキルは `skills/` 配下のみ）。
- `skills/lism-css-guide/` を更新する時の注意事項
  - 失敗例を単純に `SKILL.md` 冒頭へ積み増さないこと。具体例は `antipatterns.md`、実装プランの判断手順は `references/authoring.md`、命名は `naming.md` など、既存の詳細ファイルへ最小追記すること。
  - skillからMCPの案内はしない。
  - 各ファイルは役割ごとに分割し、タスクに必要なファイルだけを参照できる構成にすること。違反頻度の高い重要事項は`SKILL.md`または各詳細ファイルの冒頭に要約し、詳細や具体例は適切な参照ファイルへ置くこと。行数のためだけの分割はしない。
