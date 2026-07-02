# has--snap

`scroll-snap-*` 系のプロパティを CSS 変数経由でセットする Trait クラス。横スクロールカルーセルなどで子要素のスナップ位置を制御したい時に使う。

- Lism props: `hasSnap`（`<Lism hasSnap>` 等）

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/trait-class.md#has--snap

## SCSS 定義

```scss
.has--snap {
  --snapType: both mandatory;
  --snapAlign: start;
  --snapStop: normal;
  scroll-snap-type: var(--snapType);

  & > * {
    scroll-snap-align: var(--snapAlign);
    scroll-snap-stop: var(--snapStop);
  }
}
```

自身に `scroll-snap-type` を、**直下の子要素**に `scroll-snap-align` / `scroll-snap-stop` を適用する構造。

## CSS 変数

| 変数 | 役割 | デフォルト |
|------|------|-----------|
| `--snapType` | `scroll-snap-type` | `both mandatory` |
| `--snapAlign` | 子要素の `scroll-snap-align` | `start` |
| `--snapStop` | 子要素の `scroll-snap-stop` | `normal` |

## 関連

- `-ov:*` プロパティクラス — スクロールコンテナ化に必須
