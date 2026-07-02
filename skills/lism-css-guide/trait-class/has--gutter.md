# has--gutter

要素の左右に、サイト共通の gutter（余白）を適用する Trait クラス。`padding` 系ユーティリティとは別に、「サイト全体で統一した左右余白」を確保したい時に使う。

- Lism props: `hasGutter`（`<Lism hasGutter>` 等）

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/trait-class.md#has--gutter

## SCSS 定義

```scss
.has--gutter {
  --gutter: var(--gutter--base);
  padding-inline: var(--gutter);
}
```

ガター変数は `--flow--base` / `--flow` と同じ「基準値 + 要素ローカル機能変数」の2層構造を採る。

- `--gutter--base`: `:root` で `var(--s30)` をデフォルトに持つサイト全体の基準値
- `--gutter`: `.has--gutter` で `var(--gutter--base)` に初期化される要素ローカルの機能変数

## CSS 変数

| 変数 | 役割 | デフォルト |
|------|------|-----------|
| `--gutter--base` | サイト全体のガター基準値（`:root` 定義） | `var(--s30)` |
| `--gutter` | `.has--gutter` 要素ローカルの機能変数 | `var(--gutter--base)` |

- サイト全体の基準を変えたい場合は `:root` 等で `--gutter--base` を上書きする
- 個別要素のみガター量を変えたい場合は、その要素で `style="--gutter: 20px"` のように `--gutter` を直接上書きする

## 関連

- `-px:*` プロパティクラス — その要素ごとに任意の左右 padding を付けたい場合はこちら
- `is--wrapper` — コンテンツ幅制御。gutter と組み合わせてセクションラッパーを構成することが多い
