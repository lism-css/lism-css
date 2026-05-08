# is--fullwide

要素を**親要素のサイズいっぱい**まで広げる役割宣言クラス。基本は `max-inline-size: 100%`。親が `has--gutter` の場合は gutter 分を加算して**その余白を突き抜ける**（= gutter を無視して端まで広がる）。

旧 `-max-sz:full`（v0.17.0 で廃止）の置き換え。

## 基本情報

- クラス名: `is--fullwide`
- Lism props: `isFullwide`（`<Lism isFullwide>` 等）
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/trait/is/_fullwide.scss
- 公式ドキュメント: https://lism-css.com/docs/trait-class/is--fullwide.md

## CSS

```scss
.is--fullwide {
  max-inline-size: 100%;

  :where(.has--gutter) > & {
    inline-size: auto;
    max-inline-size: calc(100% + var(--gutter-size) * 2);
    margin-inline: calc(var(--gutter-size) * -1);
  }
}
```

`inline-size: auto` は、親が `is--wrapper` の場合に当たる `inline-size: 100%` を打ち消し、負 margin による hang を効かせるためのリセット。

## 使い方

`isFullwide` Prop は他のコンポーネントにも使用できます（例: `<Box isFullwide>`）。

| Prop | 出力 |
|------|------|
| `isFullwide` | `is--fullwide` |

## Usage

### `has--gutter` 内の全幅要素

```jsx
<Lism hasGutter>
  <p>通常の gutter 内コンテンツ</p>
  <Lism isFullwide as="img" src="..." alt="" />
  <p>通常の gutter 内コンテンツ</p>
</Lism>
```

```html
<div class="has--gutter">
  <p>通常の gutter 内コンテンツ</p>
  <img class="is--fullwide" src="..." alt="" />
  <p>通常の gutter 内コンテンツ</p>
</div>
```

`has--gutter` の内側で全幅画像・全幅バナーなどを配置したい時に使う。

## 関連

- [is--bleed](./is--bleed.md) — 直近の `is--container` 幅まで広げる
- [has--gutter](./has--gutter.md) — `is--fullwide` と組み合わせる左右余白
- [is--wrapper](./is--wrapper.md) — コンテンツ幅の制限
