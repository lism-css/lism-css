# l--withSide / `<WithSide>`

メディアクエリ・コンテナクエリに依存せず、**維持したいコンテンツ幅を基準にして横並び・縦並びが自動で切り替わる2カラムレイアウト**。「画像 + コンテンツ」「メインエリア + サイドバー」などに活用できる。

## 基本情報

- クラス名: `l--withSide`
- コンポーネント: `<WithSide>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_withSide.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--withSide/

## 動作の仕組み

- サイド側の横幅を `--sideW` で、メイン側で維持したい最小横幅を `--mainW` で指定
- メイン側が `--mainW` を維持できる範囲内では横並びを保ち、下回ると自動で縦並びに切り替わる
- 子要素の**一方に `is--side` を付ける必要がある**（コンポーネントでは `isSide` prop）

## 専用Props

| Prop | 出力 | デフォルト | 説明 |
|------|------|-----------|------|
| `sideW` | `--sideW` | `auto` | サイド要素の横幅 |
| `mainW` | `--mainW` | `max(20rem, 50%)` | メイン要素で維持したい最小幅 |

## HTML構造

```html
<div class="l--withSide">
  <div>Main Content</div>
  <div class="is--side">Side Content</div>
</div>
```

## Usage

### 基本的な使い方

```jsx
<WithSide sideW="12rem" mainW="20rem" g="20">
  <Box p="15" bd bdc="blue">
    <p>Main Content</p>
    <p>メインコンテンツ本文...</p>
  </Box>
  <Box isSide p="15" bd bdc="red">
    <p>Side Content</p>
  </Box>
</WithSide>
```

```html
<div class="l--withSide -g:20" style="--sideW:12rem;--mainW:20rem">
  <div class="l--box -p:15 -bd" style="--bdc:var(--blue)">
    <p>Main Content</p>
    <p>メインコンテンツ本文...</p>
  </div>
  <div class="l--box is--side -p:15 -bd" style="--bdc:var(--red)">
    <p>Side Content</p>
  </div>
</div>
```

### Side 要素の位置を反転（`-fxd:row-reverse`）

`flex-direction: row-reverse` を併用することで、横並びの時だけ順序を反転できます。**横並びで左側・縦並びで下側に Side を配置**したいときに便利。

```jsx
<WithSide fxd="row-reverse" sideW="10rem" mainW="16rem" g="20">
  <Box>
    <p>Main content...</p>
  </Box>
  <Box isSide bgc="blue:20%">Side Content</Box>
</WithSide>
```

```html
<div class="l--withSide -fxd:row-reverse -g:20" style="--sideW:10rem;--mainW:16rem">
  <div class="l--box">
    <p>Main content...</p>
  </div>
  <div class="l--box is--side">Side Content</div>
</div>
```

## `l--grid` との使い分け

- **`l--withSide`**: ブレイクポイントに依存せず、コンテンツ幅で自動切り替え
- **`l--grid`** (`<Grid gta={[...]} gtc={[...]} />`): ブレイクポイント（`sm`/`md`）で明示的に切り替えたい場合

```jsx
// ブレイクポイント依存で似たレイアウトを構築する例
<Grid gta={[`'.' 'side'`, `'. side'`]} gtc={[null, '1fr 10rem']} g="20">
  <Box>メインコンテンツ</Box>
  <Box ga="side">サイドコンテンツ</Box>
</Grid>
```

## 関連プリミティブ

- [l--grid](./l--grid.md) — ブレイクポイント切り替え型の2カラム構築に使用
- [l--autoColumns](./l--autoColumns.md) — カラム幅ベースの自動段組
- [l--switchColumns](./l--switchColumns.md) — ブレイクポイント一括切り替え型カラム
- [is--container](../trait-class/is--container.md) — レスポンシブ Property Class 利用時に必要
