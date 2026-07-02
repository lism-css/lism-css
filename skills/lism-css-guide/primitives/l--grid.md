# l--grid / `<Grid>`

コンテンツを CSS Grid レイアウトで配置するクラス。`gtc` / `gta` / `ga` などの Grid プロパティと組み合わせて使います。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/primitives/l--grid.md

## 既定の挙動

- `display:grid`。
- 直下の子要素に`min-width:0`を付与し、grid itemのはみ出しを抑えます。
- `grid-template-columns`や`gap`は既定で持たないため、必要な時だけ`gtc`/`g`などで指定します。

## 関連プリミティブ

- [l--tileGrid](./l--tileGrid.md) — 自動繰り返しのタイル型 Grid
- [l--columns](./l--columns.md) — 等幅カラム専用
- [l--withSide](./l--withSide.md) — コンテンツ幅自動切り替え型 2 カラム
