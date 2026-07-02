# has--mask

`--maskImg` 変数と組み合わせて、要素自身にマスク画像を適用する Trait クラス。SVG を使った異形シェイプ表示などに使う。

- Lism props: `hasMask`（`<Lism hasMask>` 等）

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/trait-class.md#has--mask

## SCSS 定義

```scss
.has--mask {
  --maskPos: 50%;
  --maskSize: contain;
  --maskRepeat: no-repeat;
  mask: var(--maskImg) var(--maskRepeat) var(--maskPos) / var(--maskSize);
}
```

`--maskImg` は定義されていないため、利用側で必ず指定すること。

## CSS 変数

| 変数 | 役割 | デフォルト |
| --- | --- | --- |
| `--maskImg` | マスク画像（`url(...)` で指定。SVG data URI が多い） | **未定義（必須）** |
| `--maskPos` | マスクの位置 | `50%` |
| `--maskSize` | マスクのサイズ | `contain` |
| `--maskRepeat` | マスクの繰り返し | `no-repeat` |

## 関連

- `l--frame` — アスペクト比制御。マスク画像をフィットさせるラッパーとして併用することが多い
