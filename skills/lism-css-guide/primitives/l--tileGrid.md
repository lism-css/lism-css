# l--tileGrid / `<TileGrid>`

`cols`（列数）と `rows`（行数）を指定して、**均等なタイル型グリッドレイアウト**を構成するクラス。内部的には `grid-template: repeat(rows, minmax(0, 1fr)) / repeat(cols, minmax(0, 1fr))` を使用します。

## 基本情報

- クラス名: `l--tileGrid`
- コンポーネント: `<TileGrid>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_tileGrid.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--tileGrid/

## 専用Props

| Prop | CSS変数 | 説明 | デフォルト |
|------|--------|------|------------|
| `cols` | `--cols` | 列数を指定。配列でブレイクポイント指定可 | `1` |
| `rows` | `--rows` | 行数を指定。配列でブレイクポイント指定可 | `1` |

## Usage

### 基本的な使い方

```jsx
<TileGrid cols="3" rows="3" g="5" min-h="50svh">
  <Box p="20" bgc="base-2">item1</Box>
  <Box p="20" bgc="base-2">item2</Box>
  <Box p="20" bgc="base-2">item3</Box>
  <Box p="20" bgc="base-2">item4</Box>
  <Box p="20" bgc="base-2" gc="span 2">item5</Box>
  <Center gc="3" gr="1 / -1" p="20" bgc="blue">item6</Center>
</TileGrid>
```

```html
<div class="l--tileGrid -g:5 -min-h:50svh" style="--cols: 3; --rows: 3">
  <div class="l--box -p:20 -bgc:base-2">item1</div>
  <div class="l--box -p:20 -bgc:base-2">item2</div>
  <div class="l--box -p:20 -bgc:base-2">item3</div>
  <div class="l--box -p:20 -bgc:base-2">item4</div>
  <div class="l--box -p:20 -bgc:base-2 -gc:span 2">item5</div>
  <div class="l--center -p:20 -bgc:blue" style="grid-column: 3; grid-row: 1 / -1">item6</div>
</div>
```

### ブレイクポイント別指定

`cols` / `rows` をブレイクポイントで切り替え、`gaf`（`grid-auto-flow`）と組み合わせて動的レイアウトも構築できます。

```jsx
<TileGrid cols={['2', '3']} rows="4" min-h="50svh" gaf="row dense">
  <Box gc={['1 / -1', 'span 2']} gr={['span 2', '1 / -1']} p="20" bgc="base-2">A</Box>
  <Box p="20" bgc="green:20%">B</Box>
  <Box p="20" bgc="blue:20%">C</Box>
</TileGrid>
```

## 関連プリミティブ

- [l--columns](./l--columns.md) — 等幅列のみ（1D）のカラム
- [l--fluidCols](./l--fluidCols.md) — 自動折り返し型段組
- [l--grid](./l--grid.md) — 汎用 CSS Grid
