# has--mask

`--maskImg` 変数と組み合わせて、要素自身にマスク画像を適用する Trait クラス。SVG を使った異形シェイプ表示などに使う。

## 基本情報

- クラス名: `has--mask`
- Lism props: `hasMask`（`<Lism hasMask>` 等）
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/trait/has/_mask.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/trait-class/#has--mask

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
|------|------|-----------|
| `--maskImg` | マスク画像（`url(...)` で指定。SVG data URI が多い） | **未定義（必須）** |
| `--maskPos` | マスクの位置 | `50%` |
| `--maskSize` | マスクのサイズ | `contain` |
| `--maskRepeat` | マスクの繰り返し | `no-repeat` |

## Usage

`Frame` コンポーネント（または任意の要素）に `has--mask` を付与し、`--maskImg` に SVG の data URI をセットする。

```html
<div
  class="l--frame has--mask -ar:og"
  style="--maskImg: url('data:image/svg+xml,<svg viewBox=&quot;0 0 200 200&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;><path fill=&quot;%23000000&quot; d=&quot;M170.4,25.7...Z&quot; /></svg>')"
>
  <img src="..." width="960" height="640" alt="" />
</div>
```
```jsx
<Frame
  hasMask
  ar="og"
  style={{
    '--maskImg': `url('data:image/svg+xml,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="%23000000" d="M170.4,25.7...Z" /></svg>')`
  }}
>
  <img src="..." width="960" height="640" alt="" />
</Frame>
```

### 実装メモ

- HTML 属性内で SVG data URI を使う場合、`<` / `>` / `"` をエンティティ化する必要がある
- JSX の `style` オブジェクトで渡す場合はテンプレートリテラルでそのまま書ける
- マスクの位置や繰り返しを変えたい場合は `--maskPos` / `--maskSize` / `--maskRepeat` を個別に上書き

## 関連

- `l--frame` — アスペクト比制御。マスク画像をフィットさせるラッパーとして併用することが多い
