# a--icon / `<Icon>`

アイコン要素を表示するためのクラス。`flex-shrink: 0`、デフォルトサイズ `1em`。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/primitives/a--icon.md

## 出力されるHTML構造

`<Icon>` は `label` の有無でアクセシビリティ属性を自動切り替えします。

```html
<!-- label なし -->
<svg class="a--icon" aria-hidden="true">...</svg>

<!-- label あり -->
<svg class="a--icon" aria-label="..." role="img">...</svg>
```

## 専用Props

| Prop | 説明 |
| --- | --- |
| `icon` | アイコンを指定。コンポーネント・SVG文字列・オブジェクト（`{as, ...exProps}`）を渡す |
| `size` | SVGの幅・高さの既定値。明示した`width`・`height`を優先（通常は`fz`を推奨） |
| `weight` | 線幅: `light`（1）・`regular`（1.5）・`bold`（2）。未指定ならアイコン自身の線幅を維持 |
| `strokeWidth` / `stroke-width` | 線幅の直接指定。`weight`より優先 |
| `label` | `aria-label` として出力。指定があれば `role="img"`、なければ `aria-hidden="true"` |

`lism-css`はアイコンのSVGデータを内包しません。`@lism-css/icons`から必要なコンポーネントをimportし、`icon`に渡します。色は`c`で指定します。

```jsx
import { Icon } from 'lism-css/react';
import { Check } from '@lism-css/icons/react';

<Icon icon={Check} c="green" />
```

Astroではimport元をそれぞれ`lism-css/astro`・`@lism-css/icons/astro`にします。SVG文字列を渡す場合は`<svg`で始まるSVG全体を指定します。

## 関連プリミティブ

- [a--divider](./a--divider.md) — 区切り線
- [a--spacer](./a--spacer.md) — 空白要素
- [a--decorator](./a--decorator.md) — 装飾用要素
