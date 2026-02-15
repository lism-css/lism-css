# CLAUDE.md

## プロジェクト概要

Lism CSS は軽量なCSSフレームワークで、ReactコンポーネントとAstroコンポーネントをnpmパッケージとして公開しています。
pnpm workspaces と Turbo を使用したモノレポ構造です。

## ワークスペース一覧

- `packages/lism-css/`: コアCSSライブラリ（npm公開）- 詳細は [packages/lism-css/CLAUDE.md](packages/lism-css/CLAUDE.md) を参照
- `packages/lism-ui/`: UIコンポーネントライブラリ（npm公開）- 詳細は [packages/lism-ui/CLAUDE.md](packages/lism-ui/CLAUDE.md) を参照
- `apps/docs/`: Astro + Starlight のドキュメントサイト - 詳細は [apps/docs/CLAUDE.md](apps/docs/CLAUDE.md) を参照
- `apps/playgrounds/with-vite/`: Viteでの動作テスト環境。ここは明示的に指示がない限りは編集したり読み取りしないでください。
- lint系設定ファイルは、ルート直下に配置しています。

各ワークスペースの詳細な実装やアーキテクチャについては、それぞれの CLAUDE.md ファイルを参照してください。


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

