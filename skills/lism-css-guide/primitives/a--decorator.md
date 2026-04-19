# a--decorator / `<Decorator>`

コンテンツを装飾するための空要素として使うクラス。`<Decorator>` は `<Lism atomic="decorator" aria-hidden="true" />` のエイリアスとして用意されています。

## 基本情報

- クラス名: `a--decorator`
- コンポーネント: `<Decorator>`
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/a--decorator/

## 専用Props

| Prop | 説明 |
|------|------|
| `size` | デコレーターのサイズを一括指定。この指定があると `w`（`width`）に値が渡され、自動で `ar="1/1"`（`aspect-ratio:1/1`）が付与される |

## Usage

### 装飾に使用する例（コーナー装飾）

`pos="absolute"` と組み合わせて、親の四隅にコーナー枠を配置する例です。`bdc="current"` で文字色に追随します。

```jsx
<Box p="30" pos="relative">
  <p>本文テキスト...</p>
  <Decorator size="1.25em" pos="absolute" t="0" l="0" bd-x-s bd-y-s bdc="current" />
  <Decorator size="1.25em" pos="absolute" r="0" b="0" bd-x-e bd-y-e bdc="current" />
</Box>
```

```html
<div class="l--box -p:30 -pos:relative">
  <p>本文テキスト...</p>
  <div class="a--decorator -pos:absolute -t:0 -l:0 -bd-x-s -bd-y-s -bdc:current -ar:1/1 -w" style="--w:1.25em" aria-hidden="true"></div>
  <div class="a--decorator -pos:absolute -r:0 -b:0 -bd-x-e -bd-y-e -bdc:current -ar:1/1 -w" style="--w:1.25em" aria-hidden="true"></div>
</div>
```

## 関連プリミティブ

- [a--spacer](./a--spacer.md) — 要素間スペース
- [a--divider](./a--divider.md) — 区切り線
- [is--layer](../trait-class/is--layer.md) — `position: absolute` のオーバーレイ
