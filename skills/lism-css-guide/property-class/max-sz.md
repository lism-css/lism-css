# -max-sz（最大幅）

コンテンツの最大幅（`max-inline-size`）を制御する Property Class。標準のコンテンツサイズトークン（`xs`〜`xl`）に加え、特殊挙動の `full` / `container` を持つ。

## 基本情報

- クラス名: `-max-sz:{xs|s|m|l|xl|full|container}`
- Lism props: `max-sz`（`<Lism max-sz="m">` 等）
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/props/_size.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/property-class/max-sz/

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

**親要素のサイズいっぱいに広がる**クラス。`.has--gutter` の直下では、その gutter 分を**追加で外側に**拡張する（= gutter を無視して端まで広がる）。

```scss
.-max-sz\:full {
  max-inline-size: 100%;

  :where(.has--gutter) > & {
    max-inline-size: calc(100% + var(--gutter-size) * 2);
    margin-inline: calc(var(--gutter-size) * -1);
  }
}
```

`.has--gutter` の内側で全幅画像・全幅バナーなどを配置したい時に使う。

### `-max-sz:container`

**コンテナ要素を基準としたサイズ**まで広がる。`.is--container` ごとに `--sz--container` が更新されるため、直近の container を基準にサイズ決定される。

```scss
.-max-sz\:container {
  max-inline-size: var(--sz--container, 100cqi);
  margin-inline: calc(50% - var(--sz--container) / 2);
}
```

`margin-inline` で中央配置されるので、`is--wrapper` の内側にあっても container 基準の幅に広げつつ中央に揃う。

## Usage

### トークン値での使用

```jsx
<Lism max-sz="m" mx="auto">...</Lism>
```
```html
<div class="-max-sz:m -mx:auto" style="max-inline-size: var(--sz--m)">...</div>
```

### `.has--gutter` 内の全幅要素

```html
<div class="has--gutter">
  <p>通常の gutter 内コンテンツ</p>
  <img class="-max-sz:full" src="..." alt="" />
  <p>通常の gutter 内コンテンツ</p>
</div>
```

### container 基準のサイズ

```html
<div class="is--container">
  <div class="is--wrapper -contentSize:s">
    <p>狭めのコンテンツ</p>
    <div class="-max-sz:container">
      container 基準まで広がる要素
    </div>
  </div>
</div>
```

## DEMO

`-max-sz:*` の挙動確認用デモ:
- https://lism-css.com/demo/content-size

## 関連

- [`is--container`](../trait-class/is--container.md) — `-max-sz:container` の基準となるコンテナ
- [`is--wrapper`](../trait-class/is--wrapper.md) — コンテンツ幅の制限
- [`has--gutter`](../trait-class/has--gutter.md) — `-max-sz:full` と組み合わせる左右余白
