# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Lism CSS は軽量なCSSフレームワークで、ReactコンポーネントとAstroコンポーネントをnpmパッケージとして公開しています。

pnpm workspacesとTurboを使用したモノレポ構造で構築されており、以下の構成になっています。

- `packages/lism-css/`: コアライブラリ（npm公開）- 詳細は[packages/lism-css/CLAUDE.md](packages/lism-css/CLAUDE.md)を参照
- `apps/docs/`: Astro + Starlightのドキュメントサイト - 詳細は[apps/docs/CLAUDE.md](apps/docs/CLAUDE.md)を参照
- `apps/playgrounds/with-vite/`: Viteでの動作テスト環境。ここは明示的に指示がない限りは編集したり読み取りしないでください。
- lint系設定ファイルは、ルート直下に配置しています。

## 主要コマンド

### 開発

```bash
# 個別ワークスペースで作業
cd apps/docs && pnpm dev        # ドキュメントサイト
cd packages/lism-css && pnpm dev # コアライブラリ開発
```

### ビルド

```bash
# 全ワークスペースを Turbo でビルド
pnpm build
```

### リント

```bash
pnpm lint
```

## 注意事項

- 各ワークスペースの詳細な実装やアーキテクチャについては、それぞれの`CLAUDE.md`ファイルを参照してください
- コンポーネント構造、CSSレイヤーシステム、プロップスシステムなどの詳細は`packages/lism-css/CLAUDE.md`に記載されています
- ドキュメントサイトの構成やコンテンツ管理については`apps/docs/CLAUDE.md`に記載されています
