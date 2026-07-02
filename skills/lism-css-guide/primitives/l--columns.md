# l--columns / `<Columns>`

ブレイクポイントごとに指定した列数で表示できるカラムクラス。等幅の複数カラムを定義したい場合に使います。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/primitives/l--columns.md

## 既定の挙動

- `display:grid`。
- `--cols:2`を初期値にし、`grid-template-columns:repeat(var(--cols), minmax(0, 1fr))`で等幅列を作ります。
- 等幅N列は`Grid gtc="repeat(...)"`ではなく`Columns cols={...}`を優先します。

## 専用Props

| Prop | CSS変数 | 説明 | デフォルト |
|------|--------|------|------------|
| `cols` | `--cols` | 列数を指定。配列でブレイクポイント指定可 | `2` |

## 関連プリミティブ

- [l--tileGrid](./l--tileGrid.md) — 列数×行数を指定する均等タイル
- [l--autoColumns](./l--autoColumns.md) — カラム幅ベースの自動段組
- [l--switchColumns](./l--switchColumns.md) — 複数列 ↔ 1列切り替え
