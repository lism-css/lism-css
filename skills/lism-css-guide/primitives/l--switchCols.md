# l--switchCols / `<SwitchCols>`

複数列 ↔ 1列の切り替えをコンテナクエリやメディアクエリを使わずに実装するクラス。Flexbox ベースで、親コンテナ幅に応じて自動的に折り返します。

## 基本情報

- クラス名: `l--switchCols`
- コンポーネント: `<SwitchCols>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_switchCols.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--switchCols/

## 専用Props

| Prop | CSS変数 | 説明 |
|------|--------|------|
| `breakSize` | `--breakSize` | 横並びを維持するのに必要な親コンテナ幅を指定。`sz` トークンが使える |

## Usage

### デフォルト幅で利用する

```jsx
<SwitchCols g="20">
  <div class="-bgc:base-2 -p:20">Box</div>
  <div class="-bgc:base-2 -p:20">Box</div>
  <div class="-bgc:base-2 -p:20">Box</div>
</SwitchCols>
```

```html
<div class="l--switchCols -g:20">
  <div class="-bgc:base-2 -p:20">Box</div>
  <div class="-bgc:base-2 -p:20">Box</div>
  <div class="-bgc:base-2 -p:20">Box</div>
</div>
```

### `breakSize` の指定

```jsx
<SwitchCols breakSize="s" g="20">
  <div class="-bgc:base-2 -p:20">Box</div>
  <div class="-bgc:base-2 -p:20">Box</div>
</SwitchCols>
```

```html
<div class="l--switchCols -g:20" style="--breakSize: var(--sz--s)">
  <div class="-bgc:base-2 -p:20">Box</div>
  <div class="-bgc:base-2 -p:20">Box</div>
</div>
```

### `flex-grow` で比率を調整

子要素に `flex-grow` を指定すると、横並び時の幅の比率を個別に調整できます。

```jsx
<SwitchCols breakSize="s" g="20">
  <div class="-bgc:base-2 -p:20">Box</div>
  <div class="-bgc:base-2 -p:20" style={{ flexGrow: 2 }}>Box</div>
</SwitchCols>
```

## 関連プリミティブ

- [l--fluidCols](./l--fluidCols.md) — 最小幅ベースの自動段組
- [l--columns](./l--columns.md) — ブレイクポイント指定の等幅カラム
- [l--sideMain](./l--sideMain.md) — コンテンツ幅基準の2カラム切り替え
