<h1 align="center">
  <a href="https://lism-css.com" target="_blank">
    Lism CSS
  </a>
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/lism-css"><img src="https://img.shields.io/npm/v/lism-css.svg" alt="Latest Release"></a>
  <a href="https://github.com/lism-css/lism-css/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/lism-css.svg" alt="License"></a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README.ja.md">日本語</a>
</p>

## Lism CSS とは？

Lism CSS は、WEB サイトのレイアウトを素早く、かつ美しく構築するための軽量な **CSS 設計フレームワーク**です。

[Every Layout](https://every-layout.dev/) のレイアウトプリミティブ、[Tailwind CSS](https://tailwindcss.com/) のユーティリティファーストアプローチ、[ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) のレイヤリング等に着想を得て、それらを統合して設計されています。

ビルドステップや設定は不要です。CDN 経由で CSS ファイルを読み込むか、npm からインポートするだけですぐに使い始められます。React / Astro 向けのコンポーネントも提供しており、props を通じて CSS クラスとカスタムプロパティに変換されるため、ランタイムでのスタイル生成なしにコンポーネントベースの開発が可能です。

## 特徴

- **軽量** — CSS バンドル全体で約 30 KB（gzip 圧縮時 約 8 KB）。
- **ゼロビルドフレームワーク** — CDN または npm でプレーン HTML でも動作。ビルドツールや設定は不要。
- **レイアウト優先モジュール** — プリビルトのレイアウトパターン: `l--flex`、`l--stack`、`l--grid`、`l--columns`、`l--center`、`l--sideMain` など。
- **CSS レイヤー構造** — `@layer`（lism-reset → lism-base → lism-modules → lism-custom → lism-utility）を使用した明確な詳細度管理。`lism-custom` はユーザー独自プレフィックスのクラス用レイヤーです。詳細度の衝突を最小限に抑えます。
- **デザイントークン** — カラー、スペーシング、フォントサイズ、シャドウを CSS カスタムプロパティで管理。
- **柔軟なプロップクラス** — `-{prop}:{value}` 構文（例: `-p:20`、`-bgc:base-2`、`-fz:l`）。
- **レスポンシブシステム** — ブレークポイントクラスと CSS 変数（例: `-p_sm`、`-p_md`）にデフォルトでコンテナクエリを採用し、親要素ベースのレスポンシブデザインを実現。メディアクエリへの切り替えも可能。
- **React & Astro コンポーネント** — `class="l--stack -g:20"` の代わりに `<Stack g="20">` と書ける。

## パッケージ

| パッケージ | 説明 |
|-----------|------|
| [lism-css](https://www.npmjs.com/package/lism-css) | コア CSS フレームワーク + React / Astro レイアウトコンポーネント |
| [@lism-css/ui](https://www.npmjs.com/package/@lism-css/ui) | インタラクティブ UI コンポーネント（Accordion、Modal、Tabs など） |
| [@lism-css/mcp](https://github.com/lism-css/lism-css/tree/main/packages/mcp) | AI コーディングツール向け MCP サーバー |

## クイックスタート

### CDN（ビルド不要）

```html
<link href="https://cdn.jsdelivr.net/npm/lism-css@0/dist/css/main.css" rel="stylesheet" />
```

### npm

```bash
npm i lism-css
```

```js
import 'lism-css/main.css';
```

### React

```jsx
import { Box, Flex, Stack, Grid, Text, Heading } from 'lism-css/react';

<Stack g="20">
  <Heading tag="h2" fz="xl">Welcome</Heading>
  <Flex g="20" ai="center">
    <Box p="20" bgc="base-2" bdrs="20">
      <Text fz="l">Card A</Text>
    </Box>
    <Box p="20" bgc="base-2" bdrs="20">
      <Text fz="l">Card B</Text>
    </Box>
  </Flex>
</Stack>
```

### Astro

```astro
---
import { Box, Flex, Stack, Text, Heading } from 'lism-css/astro';
---

<Stack g="20">
  <Heading tag="h2" fz="xl">Welcome</Heading>
  <Flex g="20" ai="center">
    <Box p="20" bgc="base-2" bdrs="20">
      <Text fz="l">Card A</Text>
    </Box>
    <Box p="20" bgc="base-2" bdrs="20">
      <Text fz="l">Card B</Text>
    </Box>
  </Flex>
</Stack>
```

### HTML（CSS のみ）

```html
<div class="l--stack -g:20">
  <h2 class="-fz:xl">Welcome</h2>
  <div class="l--flex -g:20 -ai:center">
    <div class="-p:20 -bgc:base-2 -bdrs:20">
      <p class="-fz:l">Card A</p>
    </div>
    <div class="-p:20 -bgc:base-2 -bdrs:20">
      <p class="-fz:l">Card B</p>
    </div>
  </div>
</div>
```

## CSS クラスの例

| タイプ | 例 |
|--------|-----|
| レイアウトプリミティブ | `l--flex`, `l--grid`, `l--stack`, `l--center`, `l--columns`, `l--sideMain` |
| ステート | `is--wrapper`, `is--container`, `is--layer` |
| プロップクラス | `-p:20`, `-bgc:base-2`, `-fz:l`, `-ta:center` |
| ブレークポイント | `-p_sm`, `-g_md`, `-fz_lg` |
| ユーティリティ | `u--cbox` |

## レスポンシブの例

**HTML:**

```html
<div class="-p:20 -p_sm -p_md" style="--p_sm:var(--s30);--p_md:var(--s40)">
  <p>sm (480px) と md (800px) のブレークポイントでパディングが変化</p>
</div>
```

**JSX:**

```jsx
<Lism p={['20', '30', '40']}>
  <p>sm (480px) と md (800px) のブレークポイントでパディングが変化</p>
</Lism>
```

## AI ツール連携

### Claude Code Skill

```bash
npx skills add lism-css/lism-css
```

詳細は [Skills ドキュメント](https://lism-css.com/docs/skills/) を参照してください。

### MCP サーバー

```bash
claude mcp add lism-css -- npx -y @lism-css/mcp
```

Cursor や VS Code のセットアップ方法は、[lism-css パッケージの README](https://www.npmjs.com/package/lism-css#ai-tool-integration) を参照してください。

### llms.txt

```
https://lism-css.com/llms.txt
```

## ドキュメント

詳細なドキュメントは [lism-css.com](https://lism-css.com) をご覧ください。

## プレイグラウンド

サンドボックス環境で Lism CSS を試す: [lism-css/lism-playgrounds](https://github.com/lism-css/lism-playgrounds)

## コミュニティ

フィードバックや質問は、[Lism CSS Discord サーバー](https://discord.gg/6PMcFHvc4h)までお気軽にどうぞ。

## クレジット

- [Phosphor Icons](https://phosphoricons.com/) — MIT License ([source](https://github.com/phosphor-icons))

## ライセンス

MIT
