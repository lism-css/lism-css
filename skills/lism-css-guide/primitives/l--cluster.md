# l--cluster / `<Cluster>`

複数の要素を横方向に並べ、数が多ければ自動的に折り返すクラス。タグリスト・ボタングループなどに使います。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/primitives/l--cluster.md

## 既定の挙動

- `display:flex`。
- `flex-wrap:wrap`で折り返しを有効化済み。
- `align-items:center`でstretchを解除済み。
- `gap`は既定で持たないため、間隔は`g`/`-g:*`で指定します。通常`fxw="wrap"`や`ai="center"`は足しません。

## 関連プリミティブ

- [l--flex](./l--flex.md) — 汎用 Flex 横並び（折り返しなしが基本）
- [l--stack](./l--stack.md) — Flex 縦並び
- [l--switchColumns](./l--switchColumns.md) — ブレイクポイントで縦横切り替えるカラム
