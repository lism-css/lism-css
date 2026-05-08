# -max-sz（最大幅）

コンテンツの最大幅（`max-inline-size`）を制御する Property Class。標準のコンテンツサイズトークン（`xs`〜`xl`）に加え、特殊挙動の `full` / `bleed` を持つ。

## 基本情報

- クラス名: `-max-sz:{xs|s|m|l|xl|full|bleed}`
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

## 特殊クラス

### `-max-sz:full`

**親要素のサイズいっぱいに広がる**クラス。`has--gutter` の直下では、その gutter 分を**追加で外側に**拡張する（= gutter を無視して端まで広がる）。

```scss
.-max-sz\:full {
  max-inline-size: 100%;

  :where(.has--gutter) > & {
    inline-size: auto;
    max-inline-size: calc(100% + var(--gutter-size) * 2);
    margin-inline: calc(var(--gutter-size) * -1);
  }
}
```

`has--gutter` の内側で全幅画像・全幅バナーなどを配置したい時に使う。`inline-size: auto` は、親が `is--wrapper` の場合に当たる `inline-size: 100%` を打ち消し、負 margin による hang を効かせるためのリセット。

### `-max-sz:bleed`

**最外側の `is--container` 幅**まで広がる。本文幅やネストされた container を突き抜け、ページ全体の full-bleed 表現を実現する。`is--container` が祖先に存在しない場合は、ビューポート幅（`100svi`）まで広がる fallback として動作する。

```scss
.-max-sz\:bleed {
  inline-size: auto;
  max-inline-size: var(--sz--bleed, 100svi);
  margin-inline: calc(50% - var(--sz--bleed, 100svi) / 2);
}
```

`--sz--bleed` は最外側の `is--container` 直下の子要素でだけ `100cqi` に上書きされ、ネストされた `is--container` は再度上書きしないため、内側の子要素は外側の値を inherit で参照する。

`margin-inline` で中央配置されるので、`is--wrapper` の内側にあっても最外側 container 基準の幅に広げつつ中央に揃う。`inline-size: auto` も同じく、`is--wrapper > *` で当たる `inline-size: 100%` を打ち消すためのリセット。

## Usage

### トークン値での使用

```jsx
<Lism max-sz="m" mx="auto">...</Lism>
```
```html
<div class="-max-sz:m -mx:auto" style="max-inline-size: var(--sz--m)">...</div>
```

### `has--gutter` 内の全幅要素

```html
<div class="has--gutter">
  <p>通常の gutter 内コンテンツ</p>
  <img class="-max-sz:full" src="..." alt="" />
  <p>通常の gutter 内コンテンツ</p>
</div>
```

### 最外側 container 基準のサイズ（full-bleed）

```html
<div class="is--container">
  <div class="is--wrapper -contentSize:s">
    <p>狭めのコンテンツ</p>
    <div class="-max-sz:bleed">
      最外側 container 幅まで広がる要素（ネストされた is--container も突き抜ける）
    </div>
  </div>
</div>
```

## DEMO

`-max-sz:*` の挙動確認用デモ:
- https://lism-css.com/demo/content-size

## 関連

- [`is--container`](../trait-class/is--container.md) — `-max-sz:bleed` の基準となるコンテナ
- [`is--wrapper`](../trait-class/is--wrapper.md) — コンテンツ幅の制限
- [`has--gutter`](../trait-class/has--gutter.md) — `-max-sz:full` と組み合わせる左右余白
