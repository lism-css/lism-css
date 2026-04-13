# l--stack / `<Stack>`

複数の要素を Flex レイアウトで縦並びに配置するクラス。`gap` で余白を管理します。

## 基本情報

- クラス名: `l--stack`
- コンポーネント: `<Stack>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_stack.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--stack/

## Usage

### 基本的な使い方

```jsx
<Stack g="20">
  <p>コンテンツ</p>
  <p>コンテンツ</p>
  <p>コンテンツ</p>
</Stack>
```

```html
<div class="l--stack -g:20">
  <p>コンテンツ</p>
  <p>コンテンツ</p>
  <p>コンテンツ</p>
</div>
```

### 内在的な中央寄せ（`ai="center"`）

`ai="center"` を併用すると、Every Layout で言うところの**内在的な中央寄せ**（コンテンツ幅が短い要素だけ中央揃え、長い要素はそのまま）になります。

```jsx
<Stack ai="center" g="20" p="30">
  <h3>見出し</h3>
  <p>短いテキスト</p>
  <p>長めのテキスト...</p>
</Stack>
```

```html
<div class="l--stack -ai:center -p:30 -g:20">
  <h3>見出し</h3>
  <p>短いテキスト</p>
  <p>長めのテキスト...</p>
</div>
```

## 関連プリミティブ

- [l--flex](./l--flex.md) — 汎用 Flex 横並び
- [l--flow](./l--flow.md) — `margin-block-start` で余白を管理するテキスト向けフロー
- [l--cluster](./l--cluster.md) — 折り返し前提の横並び
