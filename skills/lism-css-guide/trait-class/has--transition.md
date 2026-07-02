# has--transition

`transition` 系のプロパティを CSS 変数経由でセットする Trait クラス。主に `-hov:*` クラスと組み合わせて、ホバー時のスムーズな変化に使う。

- Lism props: `hasTransition`（`<Lism hasTransition>` / `<Box hasTransition>` 等）

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/trait-class.md#has--transition

## SCSS 定義

```scss
.has--transition {
  --duration: var(--transition-duration, 0.25s);
  --ease: ease;
  --delay: 0s;
  --transitionProps: all;
  transition: var(--duration) var(--ease) var(--delay);
  transition-property: var(--transitionProps);
}
```

## CSS 変数

| 変数 | 役割 | デフォルト |
| --- | --- | --- |
| `--transitionProps` | transition 対象プロパティ | `all` |
| `--duration` | トランジションの長さ | `var(--transition-duration, 0.25s)` |
| `--ease` | イージング関数 | `ease` |
| `--delay` | ディレイ | `0s` |
| `--transition-duration` | 全体のデフォルト duration を `:root` などから上書きするためのグローバル変数 | `0.25s` |

## 関連

- [`-hov:*` プロパティクラス](../property-class.md) — ホバー時の変化を定義
- [`set--hov`](../set-class.md#set--hov) — 親のホバー状態を子要素に伝播させる仕組み
