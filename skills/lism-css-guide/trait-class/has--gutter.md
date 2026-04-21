# has--gutter

要素の左右に、サイト共通の gutter（余白）を適用する Trait クラス。`padding` 系ユーティリティとは別に、「サイト全体で統一した左右余白」を確保したい時に使う。

## 基本情報

- クラス名: `has--gutter`
- Lism props: `hasGutter`（`<Lism hasGutter>` 等）
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/trait/has/_gutter.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/trait-class/#has--gutter

## SCSS 定義

```scss
.has--gutter {
  padding-inline: var(--gutter-size);
}
```

`--gutter-size` はトークン (`:root`) で `var(--s30)` がデフォルト定義されている。

## CSS 変数

| 変数 | 役割 | デフォルト |
|------|------|-----------|
| `--gutter-size` | 左右の padding 量 | `var(--s30)` |

個別要素で `--gutter-size` を上書きすれば、その要素のみ gutter 量を変更できる。

## Usage

```html
<div class="has--gutter">
  <p>Lorem ipsum content...</p>
  <p>Lorem ipsum content...</p>
</div>
```
```jsx
<Lism hasGutter>
  <p>Lorem ipsum content...</p>
  <p>Lorem ipsum content...</p>
</Lism>
```

## 関連

- `-px:*` プロパティクラス — その要素ごとに任意の左右 padding を付けたい場合はこちら
- `is--wrapper` — コンテンツ幅制御。gutter と組み合わせてセクションラッパーを構成することが多い
