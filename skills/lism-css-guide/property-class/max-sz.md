# -max-sz（最大幅）

コンテンツの最大幅（`max-inline-size`）を制御する Property Class。コンテンツサイズトークン（`xs`〜`xl`）に対応する。

## 基本情報

- クラス名: `-max-sz:{xs|s|m|l|xl}`
- Lism props: `max-sz`（`<Lism max-sz="m">` 等）
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/props/_size.scss
- 公式ドキュメント: https://lism-css.com/docs/property-class/max-sz.md

## トークン対応クラス

コンテンツサイズ用のトークン `--sz--{xs|s|m|l|xl}` にそのまま対応するクラスが用意されている。

| クラス | 値 |
|--------|-----|
| `-max-sz:xs` | `var(--sz--xs)` |
| `-max-sz:s` | `var(--sz--s)` |
| `-max-sz:m` | `var(--sz--m)` |
| `-max-sz:l` | `var(--sz--l)` |
| `-max-sz:xl` | `var(--sz--xl)` |

## Usage

### トークン値での使用

```jsx
<Lism max-sz="m" mx="auto">...</Lism>
```
```html
<div class="-max-sz:m -mx:auto" style="max-inline-size: var(--sz--m)">...</div>
```

## 親要素いっぱい・コンテナ幅まで広げたい場合

旧バージョンの `-max-sz:full` / `-max-sz:container` は v0.17.0 で Trait Class に整理され、廃止された。それぞれ以下に置き換える：

| 旧 | 新 |
|---|---|
| `-max-sz:full` | [`is--fullwide`](../trait-class/is--fullwide.md) |
| `-max-sz:container` | [`is--bleed`](../trait-class/is--bleed.md) |

## DEMO

`-max-sz:*` の挙動確認用デモ:
- https://lism-css.com/demo/content-size

## 関連

- [`is--fullwide`](../trait-class/is--fullwide.md) — 親要素のサイズいっぱいに広げる（旧 `-max-sz:full`）
- [`is--bleed`](../trait-class/is--bleed.md) — 直近の `is--container` 幅まで広げる（旧 `-max-sz:container`）
- [`is--wrapper`](../trait-class/is--wrapper.md) — コンテンツ幅の制限
