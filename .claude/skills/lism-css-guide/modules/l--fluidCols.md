# l--fluidCols / `<FluidCols>`

カラム要素が指定した幅より小さくならないように自動で折り返す、**ブレイクポイント非依存の段組みレイアウトモジュール**。`auto-fit` / `auto-fill` を使った流動カラムを簡潔に記述できます。

## 基本情報

- クラス名: `l--fluidCols`
- コンポーネント: `<FluidCols>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/modules/layout/_fluidCols.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/modules/l--fluidcols/

## 専用Props

| Prop | CSS変数 | 説明 |
|------|--------|------|
| `cols` | `--cols` | カラムが維持する最小幅を指定（`12rem`, `320px` など） |
| `autoFill` | `--autoMode` | `auto-fill` モードに切り替え（デフォルトは `auto-fit`） |

## Usage

### デフォルト幅で利用する

```jsx
<FluidCols g="20">
  <Box bxsh="20" p="20"><p>カード1のコンテンツ</p></Box>
  <Box bxsh="20" p="20"><p>カード2のコンテンツ</p></Box>
  <Box bxsh="20" p="20"><p>カード3のコンテンツ</p></Box>
</FluidCols>
```

```html
<div class="l--fluidCols -g:20">
  <div class="l--box -bxsh:20 -p:20"><p>カード1のコンテンツ</p></div>
  <div class="l--box -bxsh:20 -p:20"><p>カード2のコンテンツ</p></div>
  <div class="l--box -bxsh:20 -p:20"><p>カード3のコンテンツ</p></div>
</div>
```

### カラム最小幅と `auto-fill` の指定

```jsx
<FluidCols cols="12rem" autoFill g="20" fz="s">
  <Box bxsh="20" p="20"><p>A</p></Box>
  <Box bxsh="20" p="20"><p>B</p></Box>
  <Box bxsh="20" p="20"><p>C</p></Box>
</FluidCols>
```

### 2列 → 1列

カラム最小幅を大きめに設定すれば「2列 → コンテナが狭まれば 1列」のような段階的段組も自然に作れます。

```jsx
<FluidCols cols="320px" g="20">
  <Frame ar="16/9">
    <img src="/img/a-1.jpg" width="600" height="400" />
  </Frame>
  <Frame ar="16/9">
    <img src="/img/a-3.jpg" width="600" height="400" />
  </Frame>
</FluidCols>
```

## 関連モジュール

- [l--columns](./l--columns.md) — ブレイクポイント指定の等幅カラム
- [l--switchCols](./l--switchCols.md) — 複数列 ↔ 1列の2段階切り替え
- [l--sideMain](./l--sideMain.md) — メイン幅ベースの2カラム自動切替
