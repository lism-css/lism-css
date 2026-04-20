# -bd（ボーダー）

Lism CSS のボーダーは、CSS 変数（`--bds` / `--bdw` / `--bdc`）で管理される特殊仕様の Property Class。`-bd` または `-bd-{side}` クラスで変数管理を有効化し、`bds` / `bdc` / `bdw` Prop で個別に上書きする。

## 基本情報

- クラス名: `-bd` / `-bd-{side}` / `-bds:*` / `-bdc:*` / `-bdw` など
- Lism props: `bd`, `bd-{side}`, `bds`, `bdc`, `bdw`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/props/_border.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/property-class/bd/

## 仕組み

`.-bd` または `.-bd-{side}` クラスが付くと、以下の初期値がセットされる。

```scss
:where(.-bd, [class*=" -bd-"], [class^="-bd-"]) {
  --bds: solid;
  --bdw: 1px;
  --bdc: var(--divider);
  border-width: var(--bdw);
  border-color: var(--bdc);
}
.-bd       { border-style: var(--bds); }
.-bd-x     { border-inline-style: var(--bds); }
.-bd-y     { border-block-style: var(--bds); }
/* ...各 side ごとに style を適用 */
```

`border-width` / `border-color` は全方向で共通出力され、`border-style` だけ `.-bd` または `.-bd-{side}` が出現している方向に適用される仕組み。`--bdw` を `0 0 1px 0.5em` のような複数値にすれば、方向ごとに太さを変えられる。

## 方向指定クラス

| Prop | CSS プロパティ |
|------|--------------|
| `bd` | `border`（変数管理を有効化） |
| `bd-x` | `border-inline` |
| `bd-y` | `border-block` |
| `bd-x-s` | `border-inline-start` |
| `bd-x-e` | `border-inline-end` |
| `bd-y-s` | `border-block-start` |
| `bd-y-e` | `border-block-end` |
| `bd-t` | `border-top` |
| `bd-b` | `border-bottom` |
| `bd-l` | `border-left` |
| `bd-r` | `border-right` |

標準で用意しているのは物理方向（`-t` / `-b` / `-l` / `-r`）と論理方向（`-x` / `-y` / `-x-s` / `-x-e` / `-y-s` / `-y-e`）のみ。

## 値プロパティ

| Prop | 変数 | プリセット値クラス | BP クラス |
|------|------|-------------|-----|
| `bd` | — | `-bd:none` | — |
| `bds` | `--bds` | `-bds:dashed`, `-bds:dotted`, `-bds:double` | — |
| `bdc` | `--bdc` | `-bdc:brand`, `-bdc:accent`, `-bdc:divider`, `-bdc:inherit`, `-bdc:transparent`, `-bdc:current` | — |
| `bdw` | `--bdw` | — | `-bdw_sm`, `-bdw_md` |

`bdw` はブレイクポイント指定に対応。`--bdw` の値を BP で切り替えることで、ボーダーの方向自体を変化させることもできる。

## Usage

### 全方向にボーダー + カスタマイズ

```jsx
<Box bd p="10">...</Box>
<Box bd bds="dashed" bdw="4px" bdc="red" p="15">...</Box>
```
```html
<div class="l--box -bd -p:10">...</div>
<div class="l--box -bd -bds:dashed -p:15" style="--bdw: 4px; --bdc: var(--red)">...</div>
```

### 単一方向

```jsx
<Box bd-t px="10">-t: Top</Box>
<Box bd-x bdw="2px" px="10">inline</Box>
<Box bd-x-s bdw="2px" px="10">inline-start</Box>
```
```html
<div class="l--box -bd-t -px:10">-t: Top</div>
<div class="l--box -bd-x -px:10" style="--bdw: 2px">inline</div>
<div class="l--box -bd-x-s -px:10" style="--bdw: 2px">inline-start</div>
```

### 方向ごとに異なるスタイル

`-bd` + `--bdw` / `--bds` / `--bdc` を複数値指定すると、方向ごとにスタイルを変えられる。

```jsx
<Box bd bdw="0 0 1px .5em" bds="dashed solid" bdc="var(--purple) var(--blue)" p="15">
  border
</Box>
```
```html
<div class="l--box -bd -p:15"
     style="--bdw: 0 0 1px 0.5em; --bds: dashed solid; --bdc: var(--purple) var(--blue)">
  border
</div>
```

### ブレイクポイントで `bdw` を切り替え

```jsx
<Box bd bdw={['1px', '3px', '6px']} p="15">border</Box>
```
```html
<div class="l--box -bd -bdw_sm -bdw_md -p:15"
     style="--bdw: 1px; --bdw_sm: 3px; --bdw_md: 6px">border</div>
```

### BP でボーダー方向を切り替える

`bd-x-s` + `bd-y-s` に `bdw` の複数値を BP で差し替えると、「縦並び時は上下線・横並び時は左右線」のように方向を切り替えられる。

```jsx
<Flex fxd={['column', 'row']}>
  <Box px="15" py="5">Box</Box>
  <Box px="15" py="5" bd-x-s bd-y-s bdw={['1px 0', '0 1px']}>Box</Box>
</Flex>
```

## 関連

- [`-bdrs`](https://lism-css.com/docs/property-class/) — 角丸（`border-radius`）
- [`-bd-{side}` + `has--gutter`](../trait-class/has--gutter.md) — セクション区切りに使うと相性が良い
