# CLAUDE.md

このファイルは Claude Code および サブエージェント向けのガイドです。


## パッケージ概要

軽量な CSS フレームワーク。React コンポーネントと CSS を npm パッケージ `lism-css` として公開。

| 項目 | 内容 |
|------|------|
| ソース | `/src` |
| 出力 | `/dist`（編集禁止） |
| ビルド | Vite（React） + tsx カスタムスクリプト（CSS） |


## 開発コマンド

```bash
pnpm dev         # 開発サーバー
pnpm build       # フルビルド（React + CSS）
pnpm build:js    # React のみ（Vite + tsc）
pnpm build:css   # CSS のみ
pnpm lint:style  # SCSS/CSS リント
```


## 主要ディレクトリ

| パス | 説明 |
|------|------|
| `src/components/` | React コンポーネント |
| `src/scss/` | SCSS ソース |
| `config/` | 設定・トークン定義（パッケージルート直下） |
| `src/lib/` | ユーティリティ関数 |


## コンポーネント構造

各コンポーネントは以下のパターンに従う：

```
components/ComponentName/
├── ComponentName.jsx  # メインコンポーネント
├── getProps.js        # Props 処理ロジック（一部コンポーネントのみ）
├── index.js           # エクスポート
└── script.js          # クライアントJS（BoxLink のみ）
```

- `layout/` サブディレクトリに Box, Flow, Flex, Cluster, Stack, Grid, FluidCols, SwitchCols, SideMain, Center, Columns, Frame がある
- `state/` サブディレクトリに Container, Wrapper, Layer, BoxLink がある
- `atomic/` サブディレクトリに Icon, Divider, Spacer, Decorator がある
- `Lism` コアコンポーネントは `.tsx` / `.ts` で実装されている
- `Icon` など一部を除き、全コンポーネントは基本的に `Lism` を継承し、`getLismProps()` で Props を処理


## Props システム

React の props を CSS クラス・スタイルに変換：

| 種類 | 例 |
|------|-----|
| レスポンシブ | `p={{base: '20', md: '30'}}` または `p={['20', null, '30']}`（ユーザーが使うのは後者で、前者はシステム処理用） |
| Property Class | `-p:20`, `-bgc:base-2` |
| ブレークポイント | `-p_sm`, `-g_md` |
| 処理が特殊な props | `hov`（hover）, `bd`（border） |


## SCSS アーキテクチャ

CSS Layers による詳細度管理：

```
lism-base → lism-trait → lism-primitive → lism-component → lism-custom → lism-utility
```

`lism-trait` レイヤーには `is--`（役割宣言）と `has--`（機能付与）が含まれる。`lism-primitive` 内には `layout` / `atomic` のサブレイヤーがあり、それぞれ `l--` / `a--` を含む。`lism-trait` を `lism-primitive` より弱く配置することで、`is--boxLink` の `display: block` 等の初期化的な宣言が `l--stack` 等のレイアウトプリミティブに負けるようにしている。`lism-component` レイヤーは BEM 構造を持つ UI コンポーネント（`c--`）用で、コアでは空。

※ Props クラスは `@layer` を付けない

### 出力ファイル

| ファイル | 用途 |
|----------|------|
| `main.css` | モダンブラウザ（@layer 対応） |
| `main_no_layer.css` | レガシー対応 |

### 設定ファイル

| ファイル | 説明 |
|----------|------|
| `_prop-config.scss` | Property Class の定義 |
| `_query.scss` | ブレークポイント定義 |
| `_auto_output.scss` | 自動出力処理 |


## Astro コンポーネントの注意点

`packages/astro/` 配下の `.astro` ファイルでは、タグと `<slot />` の間に改行やスペースを入れないこと。Astro はテンプレート内のホワイトスペースをそのまま HTML に出力するため、`<span>` 等のインライン要素で不要なスペースが挿入されてしまう。

```astro
<!-- NG: スペースが入る -->
<Tag {...attrs}>
  <slot />
</Tag>

<!-- OK -->
<Tag {...attrs}><slot /></Tag>
```


## 主要ファイル

| ファイル | 説明 |
|----------|------|
| `src/lib/getLismProps.ts` | Props → CSS 変換のコアロジック |
| `src/scss/base/_tokens.scss` | デザイントークン（SCSS） |
| `config/defaults/tokens.ts` | デザイントークン（JS/TS） |

