# l--autoColumns / `<AutoColumns>`

カラム要素が指定した幅より小さくならないように自動で折り返す、**ブレイクポイント非依存の段組みクラス**。`auto-fit` / `auto-fill` を使った流動カラムを簡潔に記述できます。

## 基本情報

- クラス名: `l--autoColumns`
- コンポーネント: `<AutoColumns>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_autoColumns.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--autoColumns/

## 専用Props

| Prop | CSS変数 | デフォルト | 説明 |
|------|--------|-----------|------|
| `cols` | `--cols` | `20rem` | カラムが維持する最小幅を指定（`16em`, `320px` など） |
| `autoFill` | `--autoMode` | `auto-fit` | `auto-fill` モードに切り替え |

## Usage

### `--cols`でサイズを指定する

```jsx
<AutoColumns cols="16em" g="20">
  <Lism as="div" p="20" bd>Item A</Lism>
  <Lism as="div" p="20" bd>Item B</Lism>
  <Lism as="div" p="20" bd>Item C</Lism>
  <Lism as="div" p="20" bd>Item D</Lism>
</AutoColumns>
```

```html
<div class="l--autoColumns -g:20" style="--cols: 16em">
  <div class="-p:20 -bd">Item A</div>
  <div class="-p:20 -bd">Item B</div>
  <div class="-p:20 -bd">Item C</div>
  <div class="-p:20 -bd">Item D</div>
</div>
```

### `auto-fill`を使用する

`l--autoColumns` では、`grid-template-columns` の `repeat()` 関数の第一引数を `--autoMode` で指定できます（デフォルトは `auto-fit`）。`--autoMode:auto-fill`（`autoFill`）を指定することで、要素数が少ない時の挙動が変わります。

```jsx
<AutoColumns cols="12em" autoFill g="20" fz="s">
  <Lism as="div" p="20" bd>auto-fill</Lism>
  <Lism as="div" p="20" bd>auto-fill</Lism>
</AutoColumns>
<AutoColumns cols="12em" g="20" fz="s">
  <Lism as="div" p="20" bd>auto-fit</Lism>
  <Lism as="div" p="20" bd>auto-fit</Lism>
</AutoColumns>
```

```html
<div class="l--autoColumns -g:20 -fz:s" style="--cols:12em; --autoMode:auto-fill">
  <div class="-p:20 -bd">auto-fill</div>
  <div class="-p:20 -bd">auto-fill</div>
</div>
<div class="l--autoColumns -g:20 -fz:s" style="--cols:12em">
  <div class="-p:20 -bd">auto-fit</div>
  <div class="-p:20 -bd">auto-fit</div>
</div>
```

## 関連プリミティブ

- [l--columns](./l--columns.md) — ブレイクポイント指定の等幅カラム
- [l--switchColumns](./l--switchColumns.md) — 複数列 ↔ 1列の2段階切り替え
- [l--withSide](./l--withSide.md) — メイン幅ベースの2カラム自動切替
