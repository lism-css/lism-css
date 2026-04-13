# l--grid / `<Grid>`

コンテンツを CSS Grid レイアウトで配置するクラス。`gtc` / `gta` / `ga` などの Grid プロパティと組み合わせて使います。

## 基本情報

- クラス名: `l--grid`
- コンポーネント: `<Grid>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_grid.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--grid/

## Usage

### 基本的な使い方

`gtc`（`grid-template-columns`）で列を定義します。

```jsx
<Grid gtc="auto 1fr auto" g="15">
  <Center p="20" bgc="base-2">L</Center>
  <Center p="20" bd>Center</Center>
  <Center p="20" bgc="base-2">R</Center>
</Grid>
```

```html
<div class="l--grid -gtc -g:15" style="--gtc: auto 1fr auto">
  <div class="l--center -p:20 -bgc:base-2">L</div>
  <div class="l--center -p:20 -bd">Center</div>
  <div class="l--center -p:20 -bgc:base-2">R</div>
</div>
```

### ブレイクポイントでエリアを切り替える

`gta`（`grid-template-areas`）と `gtc` を配列で渡すと、ブレイクポイントごとに別レイアウトを定義できます。子要素には `ga`（`grid-area`）で対応するエリア名を指定します。

```jsx
<Grid g="15" gtc={['1fr 1fr', '8em 1fr 8em']} gta={[`'main main' 'left right'`, `'left main right'`]}>
  <Box ga="left" p="15" bgc="base-2">Left</Box>
  <Box ga="main" p="15" bd>Center</Box>
  <Box ga="right" p="15" bgc="base-2">Right</Box>
</Grid>
```

### 子要素を重ねて表示する（`ga="1/1"`）

`position: absolute` を使わず、`grid-area: 1/1` を複数子要素に指定することで要素を重ねられます。

```jsx
<Grid ar="16/9">
  <Frame ga="1/1" w="100%" h="100%" pos="relative">
    <Media src="/img/a-1.jpg" alt="" inferSize />
    <Layer bgc="rgb(0 0 0 / 40%)" />
  </Frame>
  <Center ga="1/1" fz="3xl" z="1" c="white">SAMPLE TEXT</Center>
</Grid>
```

### subgrid の活用

`gtc="subgrid"` を入れ子の Grid に指定することで親 Grid のトラックを継承し、複数行を揃えたレイアウトが作れます。記事一覧やテーブル風レイアウトに活用できます。

## 関連プリミティブ

- [l--tileGrid](./l--tileGrid.md) — 自動繰り返しのタイル型 Grid
- [l--columns](./l--columns.md) — 等幅カラム専用
- [l--sideMain](./l--sideMain.md) — コンテンツ幅自動切り替え型 2 カラム
