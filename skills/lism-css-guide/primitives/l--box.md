# l--box / `<Box>`

コンテンツをグループ化するだけのシンプルなクラス。汎用的な箱として、パディング・ボーダー・背景色などの指定に使います。

## 基本情報

- クラス名: `l--box`
- コンポーネント: `<Box>`
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--box/

## Usage

### 基本的な使い方

```jsx
<Box p="30" bgc="base-2" bxsh="10" bdrs="10">
  <p>コンテンツ...</p>
</Box>
```

```html
<div class="l--box -p:30 -bgc:base-2 -bxsh:10 -bdrs:10">
  <p>コンテンツ...</p>
</div>
```

## 関連プリミティブ

- [l--flow](./l--flow.md) — テキスト主体のフローレイアウト
- [l--stack](./l--stack.md) — Flex 縦並び
- [is--wrapper](../trait-class/is--wrapper.md) — コンテンツ幅ラッパー
