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
- `packages/lism-cli/`: Lism UI コンポーネントをプロジェクトに追加する CLI ツール
- `packages/mcp/`: AI コーディングツール向け MCP サーバー

### apps
- `apps/docs/`: Astro ベースのドキュメントサイト — [CLAUDE.md](apps/docs/CLAUDE.md)
- `apps/catalog/`: コンポーネントカタログ
- `apps/playgrounds/with-vite/`: Vite での動作テスト環境。明示的に指示がない限り編集・読み取りしないこと

各ワークスペースの詳細な実装やアーキテクチャについては、それぞれの CLAUDE.md や README.md を参照。


## Git / PR 運用

- デフォルトの作業ブランチは `dev`（`main` ではない）
- 新しいブランチを作成する際は、必ず `dev` から切ること（`main` から切らない）
- プルリクエストのターゲットブランチも `dev`

## 主要コマンド


```bash
nr dev:docs # ドキュメントサイトlocalhostの立ち上げ
nr build  # 全ワークスペースを Turbo でビルド
nr build:core # packages/lism-css のみビルド
nr build:ui # packages/lism-ui のみビルド
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

- スキルやドキュメントの更新時に `packages/mcp/src/data/*.json` を参照しないこと（手動管理に起因する不整合があるため）。情報源は `apps/docs/src/content/` やパッケージソースを使う
- `lism-css-guide` スキルに関しては、`lism-css`パッケージ本体を編集中の場合は明示的に指示がない限り読み込まないこと。
- `examples/*` を新規追加する際は、`package.json` に `"private": true` を必ず付与すること（npm への誤公開防止）。
