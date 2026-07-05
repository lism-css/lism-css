# l--tileGrid / `<TileGrid>`

`cols`（列数）と `rows`（行数）を指定して、**均等なタイル型グリッドレイアウト**を構成するクラス。内部的には `grid-template: repeat(rows, minmax(0, 1fr)) / repeat(cols, minmax(0, 1fr))` を使用します。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/primitives/l--tileGrid.md

## 既定の挙動

- `display:grid`。
- `grid-template:repeat(var(--rows, 1), minmax(0, 1fr)) / repeat(var(--cols, 1), minmax(0, 1fr))`で行数・列数を均等に割ります。
- `rows`/`cols`を省略するとどちらも1です。

## 専用Props

| Prop | CSS変数 | 説明 | デフォルト |
| --- | --- | --- | --- |
| `cols` | `--cols` | 列数を指定。配列でブレイクポイント指定可 | `1` |
| `rows` | `--rows` | 行数を指定。配列でブレイクポイント指定可 | `1` |

## 関連プリミティブ

- [l--columns](./l--columns.md) — 等幅列のみ（1D）のカラム
- [l--autoColumns](./l--autoColumns.md) — 自動折り返し型段組
- [l--grid](./l--grid.md) — 汎用 CSS Grid
