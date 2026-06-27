# l--stack / `<Stack>`

複数の要素を Flex レイアウトで縦並びに配置するクラス。`gap` で余白を管理します。

## 基本情報

- クラス名: `l--stack`
- コンポーネント: `<Stack>`
- 公式ドキュメント: https://lism-css.com/docs/primitives/l--stack.md

**使い方・コード例については、公式ドキュメントを参照すること。**

## 既定の挙動

- `display:flex`。
- `flex-direction:column`で縦並びにします。
- `gap`は既定で持たないため、間隔は`g`/`-g:*`で指定します。通常`fxd="column"`は足しません。

## 関連プリミティブ

- [l--flex](./l--flex.md) — 汎用 Flex 横並び
- [l--flow](./l--flow.md) — `margin-block-start` で余白を管理するテキスト向けフロー
- [l--cluster](./l--cluster.md) — 折り返し前提の横並び
