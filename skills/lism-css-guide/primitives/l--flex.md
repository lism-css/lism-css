# l--flex / `<Flex>`

コンテンツを Flex レイアウトで配置するためのクラス。

## 基本情報

- クラス名: `l--flex`
- コンポーネント: `<Flex>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_flex.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--flex/

## Usage

### 基本的な使い方

```jsx
<Flex>
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</Flex>
```

```html
<div class="l--flex">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>
```

### Flex プロパティの指定

Property Class や Lism Props で Flex 関連プロパティ（`g`, `fxw`, `jc`, `ai`, `fxd` など）を指定できます。レスポンシブ対応プロパティは配列・オブジェクトで指定可能。

```jsx
<Flex fxw="wrap" jc="center" g="20">
  <div>Flex Content</div>
  <div>Flex Content</div>
  <div>Flex Content</div>
</Flex>
```

```html
<div class="l--flex -fxw:wrap -g:20 -jc:center">
  <div>Flex Content</div>
  <div>Flex Content</div>
  <div>Flex Content</div>
</div>
```

### 子要素の Flex プロパティ

子要素側も `fx`（flex shorthand）, `fxb`（flex-basis）, `fxg`（flex-grow）, `fxsh`（flex-shrink）などで個別制御できます。

```jsx
<Flex g="20">
  <Lism fx="1">Flex Content</Lism>
  <Lism fxb={['33%', '25%']}>Flex Content</Lism>
</Flex>
```

```html
<div class="l--flex -g:20">
  <div class="-fx:1">Flex Content</div>
  <div class="-fxb -fxb_sm" style="--fxb:33%;--fxb_sm:25%">Flex Content</div>
</div>
```

## 関連プリミティブ

- [l--stack](./l--stack.md) — 縦積みの Flexbox（`flex-direction: column`）
- [l--cluster](./l--cluster.md) — 折り返し前提の横並び（`flex-wrap: wrap`）
- [l--grid](./l--grid.md) — CSS Grid レイアウト
