# is--layer / `<Layer>`

`position: absolute` で親要素の上に被せて配置するオーバーレイ用クラス。親には `pos="relative"` が必要です。

## 基本情報

- クラス名: `is--layer`
- コンポーネント: `<Layer>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/trait/is/_layer.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/trait-class/is--layer/

## 使い方

`<Layer>` は `<Lism isLayer>` のエイリアスです。他コンポーネントにも `isLayer` Prop で付与できます（例: `<Frame isLayer>`）。

## Usage

### 基本的な使い方

親要素に `pos="relative"` を指定し、子に `<Layer>` を置くことで上に重なるオーバーレイになります。

```jsx
<Box pos="relative" py="40">
  <Text fz="2xl" fw="bold" ta="center">BACKGROUND</Text>
  <Layer p="15" bgc="purple:10%">
    <p>Layer Contents...</p>
  </Layer>
</Box>
```

```html
<div class="l--box -pos:relative -py:40">
  <p class="-fz:2xl -fw:bold -ta:center">BACKGROUND</p>
  <div class="is--layer -p:15 -bgc" style="--bgc: color-mix(in srgb, var(--purple) 10%, transparent)">
    <p>Layer Contents...</p>
  </div>
</div>
```

### backdrop-filter の活用

`style` プロパティで `backdropFilter` を直接指定すると、背景をブラー・セピアなどの効果で加工できます。

```jsx
<Frame ar="2/1" pos="relative">
  <img src="/img/a-1.jpg" alt="" width="960" height="640" />
  <Layer style={{ backdropFilter: 'contrast(1.1) sepia(0.4)' }} />
</Frame>
```

### メディアレイヤー（画像を背景にする）

`<Frame isLayer>` でメディアをレイヤー化して背景画像として配置し、さらに `<Layer>` で暗幕を重ね、本文は `pos="relative"` で上にのせる構成が定番です。

```jsx
<Box pos="relative" py="50" px="40">
  <Frame isLayer>
    <Media src="/img/a-2.jpg" alt="" width="960" height="640" />
  </Frame>
  <Layer bgc="black:50%" />
  <Stack pos="relative" g="30" c="white">
    <p>本文テキスト...</p>
  </Stack>
</Box>
```

## 関連プリミティブ

- [l--frame](../primitives/l--frame.md) — `isLayer` 併用でメディア背景のレイヤー化
- [l--grid](../primitives/l--grid.md) — `ga="1/1"` で position を使わずに重ね配置する代替パターン
- [l--center](../primitives/l--center.md) — レイヤー内のコンテンツ中央寄せ
