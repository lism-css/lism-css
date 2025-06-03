# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Lism CSS は軽量なCSSフレームワークとReactコンポーネントライブラリです。pnpm workspacesとTurboを使用したモノレポ構造で構築されています。

## 主要コマンド

### 開発
```bash
# 全ワークスペースで開発サーバー起動
pnpm dev

# 個別ワークスペースで作業
cd apps/docs && npm run dev        # ドキュメントサイト (localhost:4321)
cd packages/lism-css && npm run dev # コアライブラリ開発
```

### ビルド
```bash
# 全ワークスペースをビルド
pnpm build

# lism-cssパッケージのみビルド
pnpm build:core
```

### リント
```bash
# JavaScript/TypeScriptのリント
pnpm lint

# SCSS/CSSのリント（Stylelint）
pnpm lint:style
```

## アーキテクチャ

### ワークスペース構成
- `packages/lism-css/`: コアライブラリ（npm公開）
- `apps/docs/`: Astro + Starlightのドキュメントサイト
- `apps/playgrounds/with-vite/`: Vite開発環境

### コンポーネント構造
```
components/ComponentName/
├── ComponentName.jsx    # メインReactコンポーネント
├── getProps.js         # プロップス処理ロジック
├── index.js            # エクスポート
├── style.scss          # コンポーネント固有スタイル（オプション）
└── script.js           # クライアントサイドJS（オプション）
```

### CSS レイヤーシステム
詳細度管理のため`@layer`を使用：
```
reset → base → state → layout → dynamic → component → utility → props
```

### プロップスシステム
- レスポンシブ対応: `{base: '20', md: '40', lg: '60'}`
- ユーティリティクラス: `-p:20`, `-bgc:base-2`
- 特殊プロップス: `hov`（ホバー）、`bd`（ボーダー）、`trs`（トランジション）

### ビルドプロセス
1. **ReactコンポーネントとCSS**: Viteでバンドル
2. **SCSS**: `scss-builder.cjs`でDart Sass + PostCSSを使用
3. **エクスポート**: package.json exportsで複数エントリーポイント提供

### 重要なファイル
- デザイントークン: `/packages/lism-css/src/scss/base/_tokens.scss`
- JSトークン: `/packages/lism-css/src/config/tokens.js`
- 各ワークスペースの`CLAUDE.md`も参照してください