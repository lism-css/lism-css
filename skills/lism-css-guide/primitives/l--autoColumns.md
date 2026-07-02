# l--autoColumns / `<AutoColumns>`

カラム要素が指定した幅より小さくならないように自動で折り返す、**ブレイクポイント非依存の段組みクラス**。`auto-fill` / `auto-fit` を使った流動カラムを簡潔に記述できます。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/primitives/l--autoColumns.md

## 既定の挙動

- `display:grid`。
- `--cols:20rem`、`--autoMode:auto-fill`を初期値にします。
- `grid-template-columns:repeat(var(--autoMode), minmax(min(var(--cols), 100%), 1fr))`で最小幅ベースの自動段組みを作ります。

## 専用Props

| Prop | CSS変数 | デフォルト | 説明 |
|------|--------|-----------|------|
| `cols` | `--cols` | `20rem` | カラムが維持する最小幅を指定（`16em`, `320px` など） |
| `autoFit` | `--autoMode` | `auto-fill` | `auto-fit` モードに切り替え |

## 関連プリミティブ

- [l--columns](./l--columns.md) — ブレイクポイント指定の等幅カラム
- [l--switchColumns](./l--switchColumns.md) — 複数列 ↔ 1列の2段階切り替え
- [l--withSide](./l--withSide.md) — メイン幅ベースの2カラム自動切替
