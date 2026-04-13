# l--columns / `<Columns>`

ブレイクポイントごとに指定した列数で表示できるカラムクラス。等幅の複数カラムを定義したい場合に使います。

## 基本情報

- クラス名: `l--columns`
- コンポーネント: `<Columns>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_columns.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--columns/

## 専用Props

| Prop | CSS変数 | 説明 | デフォルト |
|------|--------|------|------------|
| `cols` | `--cols` | 列数を指定。配列でブレイクポイント指定可 | `2` |

## Usage

### 2列レイアウト

```jsx
<Columns cols={2} g="20">
  <Box bgc="base-2" p="20">Box</Box>
  <Box bgc="base-2" p="20">Box</Box>
  <Box bgc="base-2" p="20">Box</Box>
  <Box bgc="base-2" p="20">Box</Box>
</Columns>
```

```html
<div class="l--columns -g:20" style="--cols: 2">
  <div class="l--box -bgc:base-2 -p:20">Box</div>
  <div class="l--box -bgc:base-2 -p:20">Box</div>
  <div class="l--box -bgc:base-2 -p:20">Box</div>
  <div class="l--box -bgc:base-2 -p:20">Box</div>
</div>
```

### ブレイクポイント別指定

```jsx
<Columns cols={[1, 2, 3]} g="20">
  <Box>Box1</Box>
  <Box>Box2</Box>
  <Box>Box3</Box>
</Columns>
```

```html
<div class="l--columns -cols_sm -cols_md -g:20" style="--cols: 1; --cols_sm: 2; --cols_md: 3">
  <div class="l--box">Box1</div>
  <div class="l--box">Box2</div>
  <div class="l--box">Box3</div>
</div>
```

`null` でブレイクポイントをスキップ可：`cols={[2, null, 4]}` で「デフォルト2列、`md` から4列」になります。

### `gc`（grid-column）で子要素の横幅を個別制御

子要素側で `gc="span 2"` のように指定すると、その子だけ複数列にまたがって配置できます。`cols="6"` 等の多めの列数と組み合わせると、不揃いなブロックレイアウトを作れます。

### subgrid でカード高さ揃え

子要素を `<Grid gtr="subgrid" gr="span 4">` にすると、親 Columns の行グリッドを継承しカード内のメディア・タイトル・本文・フッタを縦方向に揃えられます。

## 関連プリミティブ

- [l--tileGrid](./l--tileGrid.md) — 列数×行数を指定する均等タイル
- [l--fluidCols](./l--fluidCols.md) — カラム幅ベースの自動段組
- [l--switchCols](./l--switchCols.md) — 複数列 ↔ 1列切り替え
