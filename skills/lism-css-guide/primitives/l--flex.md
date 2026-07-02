# l--flex / `<Flex>`

コンテンツを Flex レイアウトで配置するためのクラス。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/primitives/l--flex.md

## 既定の挙動

- `display:flex`。
- 直下の子要素に`min-width:0`を付与し、flex itemのはみ出しを抑えます。
- `gap`、`flex-wrap`、`align-items`、`justify-content`、`flex-direction`は既定では指定しません。必要な時だけ`g`/`fxw`/`ai`/`jc`/`fxd`で指定します。

## 関連プリミティブ

- [l--stack](./l--stack.md) — 縦積みの Flexbox（`flex-direction: column`）
- [l--cluster](./l--cluster.md) — 折り返し前提の横並び（`flex-wrap: wrap`）
- [l--grid](./l--grid.md) — CSS Grid レイアウト
