# CLAUDE.md


## 動作ルール
- 会話・質問は全てこのプロジェクトに関することです。その前提で回答してください
- 実装・設計・ファイル変更を伴う作業を勝手に行わないこと。ユーザーがタスク実装コマンドやスキルを提示するか、または明示的に実装許可を出すまで待って下さい。
- 質問への回答や簡単な説明は即座に対応して構いません。
- `lism-css-guide` スキルは、明示的に指示がない限り読み込まないこと（ユーザー向けのスキルであり、開発中は不要）


## プロジェクト概要

Lism CSS は軽量なCSSフレームワークで、ReactコンポーネントとAstroコンポーネントをnpmパッケージとして公開しています。
pnpm workspaces と Turbo を使用したモノレポ構造です。

## ワークスペース一覧

- `packages/lism-css/`: コアCSSライブラリ（npm公開）- 詳細は [packages/lism-css/CLAUDE.md](packages/lism-css/CLAUDE.md) を参照
- `packages/lism-ui/`: UIコンポーネントライブラリ（npm公開）- 詳細は [packages/lism-ui/CLAUDE.md](packages/lism-ui/CLAUDE.md) を参照
- `apps/docs/`: Astro ベースのドキュメントサイト - 詳細は [apps/docs/CLAUDE.md](apps/docs/CLAUDE.md) を参照
- `apps/playgrounds/with-vite/`: Viteでの動作テスト環境。ここは明示的に指示がない限りは編集したり読み取りしないでください。
- lint系設定ファイルは、ルート直下に配置しています。

各ワークスペースの詳細な実装やアーキテクチャについては、それぞれの CLAUDE.md ファイルを参照してください。


## Git / PR 運用

- プルリクエストのデフォルトターゲットブランチは `dev`（`main` ではない）


## 主要コマンド

### 開発

```bash
cd apps/docs && pnpm dev        # ドキュメントサイト
cd packages/lism-css && pnpm dev # コアライブラリ開発
```

### ビルド

```bash
pnpm build  # 全ワークスペースを Turbo でビルド
```

### リント

```bash
pnpm lint
```

### typescript チェック

```bash
pnpm typecheck
``` 

### テスト

```bash
pnpm test
```
