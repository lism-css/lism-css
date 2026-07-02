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
| `icon` | アイコンを指定。文字列（プリセット名）・オブジェクト（`{as, ...exProps}`）のどちらでも可 |
| `size` | プリセットアイコン使用時の `width` / `height`（通常は `fz` で指定するほうが推奨） |
| `label` | `aria-label` として出力。指定があれば `role="img"`、なければ `aria-hidden="true"` |

## 関連プリミティブ

- [a--divider](./a--divider.md) — 区切り線
- [a--spacer](./a--spacer.md) — 空白要素
- [a--decorator](./a--decorator.md) — 装飾用要素
