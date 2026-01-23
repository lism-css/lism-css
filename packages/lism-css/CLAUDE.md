# CLAUDE.md

このファイルは Claude Code および サブエージェント向けのガイドです。

---

## パッケージ概要

軽量な CSS フレームワーク。React コンポーネントと CSS を npm パッケージ `lism-css` として公開。

| 項目 | 内容 |
|------|------|
| ソース | `/src` |
| 出力 | `/dist`（編集禁止） |
| ビルド | Vite（React） + scss-builder（CSS） |

---

## 開発コマンド

```bash
pnpm dev         # 開発サーバー
pnpm build       # フルビルド（React + CSS）
pnpm build:vite  # React のみ
pnpm build:css   # CSS のみ
pnpm lint:style  # SCSS/CSS リント
```

---

## 主要ディレクトリ

| パス | 説明 |
|------|------|
| `src/components/` | React コンポーネント |
| `src/scss/` | SCSS ソース |
| `src/config/` | 設定・トークン定義 |
| `src/lib/` | ユーティリティ関数 |

---

## コンポーネント構造

各コンポーネントは以下のパターンに従う：

```
components/ComponentName/
├── ComponentName.jsx  # メインコンポーネント
├── getProps.js        # Props 処理ロジック
├── index.js           # エクスポート
├── style.scss         # スタイル（任意）
└── script.js          # クライアントJS（任意）
```

`Icon`など一部を覗き、全コンポーネントは基本的に `Lism` を継承し、`getLismProps()` で Props を処理。

---

## Props システム

React の props を CSS クラス・スタイルに変換：

| 種類 | 例 |
|------|-----|
| レスポンシブ | `p={{base: '20', md: '30'}}` または `p={['20', null, '30']}`（ユーザーが使うのは後者で、前者はシステム処理用） |
| Prop Class | `-p:20`, `-bgc:base-2` |
| ブレークポイント | `-p_sm`, `-g_md` |
| 処理が特殊な props | `hov`（hover）, `bd`（border） |

---

## SCSS アーキテクチャ

CSS Layers による詳細度管理：

```
lism-reset → lism.base → lism.modules → lism.utility
```

※ Props クラスは `@layer` を付けない

### 出力ファイル

| ファイル | 用途 |
|----------|------|
| `main.css` | モダンブラウザ（@layer 対応） |
| `main_no_layer.css` | レガシー対応 |

### 設定ファイル

| ファイル | 説明 |
|----------|------|
| `_props.scss` | Prop Class の定義 |
| `_query.scss` | ブレークポイント定義 |
| `_auto_output.scss` | 自動出力処理 |

---

## 主要ファイル

| ファイル | 説明 |
|----------|------|
| `src/lib/getLismProps.js` | Props → CSS 変換のコアロジック |
| `src/scss/base/_tokens.scss` | デザイントークン（SCSS） |
| `src/config/tokens.js` | デザイントークン（JS） |

---

## 注意事項

- `dist/` ディレクトリは編集禁止（ビルド生成物）
- lint 設定はモノレポルートに配置
