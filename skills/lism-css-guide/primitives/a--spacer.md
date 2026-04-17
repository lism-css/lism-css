# a--spacer / `<Spacer>`

要素間のスペースを確保するクラス。`<Spacer>` は `<Lism atomic="spacer" aria-hidden="true" />` のエイリアスとして用意されています。

## 基本情報

- クラス名: `a--spacer`
- コンポーネント: `<Spacer>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/atomic/_spacer.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/a--spacer/

## 専用Props

`<Spacer>` では **`w` / `h` に対して SPACE トークンの値**が使えます（他のコンポーネントでは SIZE トークンが優先されるため、スペースサイズを直感的に指定できる特殊対応）。

## Usage

### 縦方向のスペース

```jsx
<p>Content...</p>
<Spacer h="100px" />
<p>Content...</p>
```

```html
<p>Content...</p>
<div class="a--spacer -h" style="--h:100px" aria-hidden="true"></div>
<p>Content...</p>
```

### SPACE トークンを使う

```jsx
<p>Content...</p>
<Spacer h="60" />
<p>Content...</p>
```

```html
<p>Content...</p>
<div class="a--spacer -h" style="--h:var(--s60)" aria-hidden="true"></div>
<p>Content...</p>
```

### 横方向のスペーサー

Flex コンテナ内で `w` を指定すれば横方向のスペーサーとしても使えます。

```jsx
<Flex g="10">
  <Box p="20" bd>Box</Box>
  <Spacer w="40" />
  <Box p="20" bd>Box</Box>
  <Box p="20" bd>Box</Box>
</Flex>
```

## 関連プリミティブ

- [a--divider](./a--divider.md) — 区切り線
- [a--decorator](./a--decorator.md) — 装飾用空要素
- [l--stack](./l--stack.md) — `gap` で余白を管理する縦積み
