# a--decorator / `<Decorator>`

コンテンツを装飾するための空要素として使うクラス。`<Decorator>` は `<Lism atomic="decorator" aria-hidden="true" />` のエイリアスとして用意されています。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/primitives/a--decorator.md

## 専用Props

| Prop | 説明 |
|------|------|
| `size` | デコレーターのサイズを一括指定。この指定があると `w`（`width`）に値が渡され、自動で `ar="1/1"`（`aspect-ratio:1/1`）が付与される |

## 関連プリミティブ

- [a--spacer](./a--spacer.md) — 要素間スペース
- [a--divider](./a--divider.md) — 区切り線
- [is--layer](../trait-class/is--layer.md) — `position: absolute` のオーバーレイ
