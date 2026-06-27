# is--layer / `<Layer>`

`position: absolute` で親要素の上に被せて配置するオーバーレイ用クラス。親には `pos="relative"` が必要です。

## 基本情報

- クラス名: `is--layer`
- コンポーネント: `<Layer>`
- 公式ドキュメント: https://lism-css.com/docs/trait-class/is--layer.md

**使い方・コード例については、公式ドキュメントを参照すること。**

## 使い方

`<Layer>` は `<Lism isLayer>` のエイリアスです。他コンポーネントにも `isLayer` Prop で付与できます（例: `<Frame isLayer>`）。

## 関連プリミティブ

- [l--frame](../primitives/l--frame.md) — `isLayer` 併用でメディア背景のレイヤー化
- [l--grid](../primitives/l--grid.md) — `ga="1/1"` で position を使わずに重ね配置する代替パターン
- [l--center](../primitives/l--center.md) — レイヤー内のコンテンツ中央寄せ
