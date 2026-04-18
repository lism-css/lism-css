# l--cluster / `<Cluster>`

複数の要素を横方向に並べ、数が多ければ自動的に折り返すクラス。タグリスト・ボタングループなどに使います。

## 基本情報

- クラス名: `l--cluster`
- コンポーネント: `<Cluster>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_cluster.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--cluster/

## Usage

### 基本的な使い方

```jsx
<Cluster g="15">
  <Lism bd px="10" bdrs="10">Lorem</Lism>
  <Lism bd px="10" bdrs="10">ipsum</Lism>
  <Lism bd px="10" bdrs="10">Dolor</Lism>
  <Lism bd px="10" bdrs="10">Sit amet</Lism>
</Cluster>
```

```html
<div class="l--cluster -g:15">
  <span class="-bd -px:10 -bdrs:10">Lorem</span>
  <span class="-bd -px:10 -bdrs:10">ipsum</span>
  <span class="-bd -px:10 -bdrs:10">Dolor</span>
  <span class="-bd -px:10 -bdrs:10">Sit amet</span>
</div>
```

## 関連プリミティブ

- [l--flex](./l--flex.md) — 汎用 Flex 横並び（折り返しなしが基本）
- [l--stack](./l--stack.md) — Flex 縦並び
- [l--switchCols](./l--switchCols.md) — ブレイクポイントで縦横切り替えるカラム
