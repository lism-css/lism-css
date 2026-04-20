# a--divider / `<Divider>`

コンテンツ間に区切り線を描画するクラス。`--bdc` は `var(--divider)` が初期セットされます。`<Divider>` は `<Lism atomic="divider" aria-hidden="true" />` のエイリアスとして用意されています。

## 基本情報

- クラス名: `a--divider`
- コンポーネント: `<Divider>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/atomic/_divider.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/a--divider/

## Usage

### 基本的な使い方

```jsx
<Box bgc="base-2" py="40" ta="center">...Contents...</Box>
<Divider />
<Box bgc="base-2" py="40" ta="center">...Contents...</Box>
```

```html
<div class="l--box -bgc:base-2 -py:40 -ta:center">...Contents...</div>
<div class="a--divider" aria-hidden="true"></div>
<div class="l--box -bgc:base-2 -py:40 -ta:center">...Contents...</div>
```

### スタイルの変更

```jsx
<Divider bds="dotted" bdw="4px" bdc="blue" />
```

```html
<div class="a--divider" aria-hidden="true" style="--bds: dotted; --bdw: 4px; --bdc: var(--blue)"></div>
```

### 縦方向の区切り線

Property Class `-wm:vertical-rl`（または `<Divider wm="vertical-rl">`）を指定すると縦方向の区切り線になります。Flex 子要素として使うなら `aslf="stretch"` で高さいっぱいに伸ばせます。

```jsx
<Flex ai="center" g="20">
  <Box fx="1" bgc="base-2" py="40">...Contents...</Box>
  <Divider wm="vertical-rl" bds="dashed" bdw="2px" aslf="stretch" />
  <Box fx="1" bgc="base-2" py="40">...Contents...</Box>
</Flex>
```

```html
<div class="l--flex -g:20 -ai:center">
  <div class="-fx:1 -bgc:base-2 -py:40">...Contents...</div>
  <div class="a--divider -wm:vertical-rl -aslf:stretch" style="--bds: dashed; --bdw: 2px" aria-hidden="true"></div>
  <div class="-fx:1 -bgc:base-2 -py:40">...Contents...</div>
</div>
```

## 関連プリミティブ

- [a--spacer](./a--spacer.md) — 要素間のスペース確保
- [a--decorator](./a--decorator.md) — 装飾用空要素
- [a--icon](./a--icon.md) — アイコン要素
