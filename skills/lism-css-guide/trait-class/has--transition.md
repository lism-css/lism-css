# has--transition

`transition` 系のプロパティを CSS 変数経由でセットする Trait クラス。主に `-hov:*` クラスと組み合わせて、ホバー時のスムーズな変化に使う。

## 基本情報

- クラス名: `has--transition`
- Lism props: `hasTransition`（`<Lism hasTransition>` / `<Box hasTransition>` 等）
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/trait/has/_transition.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/trait-class/#has--transition

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
|------|------|-----------|
| `--transitionProps` | transition 対象プロパティ | `all` |
| `--duration` | トランジションの長さ | `var(--transition-duration, 0.25s)` |
| `--ease` | イージング関数 | `ease` |
| `--delay` | ディレイ | `0s` |
| `--transition-duration` | 全体のデフォルト duration を `:root` などから上書きするためのグローバル変数 | `0.25s` |

## Usage

### 基本：`-hov:*` と組み合わせる

```html
<div class="has--transition -hov:-c" style="--transitionProps: color; --hov-c: var(--red);">Example</div>
```
```jsx
<Lism hasTransition hov={{c: 'red'}} style={{ '--transitionProps': 'color'}}>Example</Lism>
```

### `duration` を個別に上書き

```html
<a class="is--boxLink has--transition -hov:-bdc -bd -p:20" style="--hov-bdc: var(--red); --duration: 0.5s">
  ...
</a>
```
```jsx
<BoxLink href="###" hasTransition hov={{ bdc: 'red' }} bd p="20" style={{ '--duration': '.5s' }}>
  ...
</BoxLink>
```

### `box-shadow` を変化させる例

```html
<a href="###" class="is--boxLink has--transition -bxsh:10 -hov:-bxsh -bd -p:20" style="--hov-bxsh: var(--bxsh--40)">
  ...
</a>
```
```jsx
<BoxLink href="###" hasTransition bxsh="10" hov={{ bxsh: '40' }} bd p="20">...</BoxLink>
```

## 関連

- [`-hov:*` プロパティクラス](../property-class.md) — ホバー時の変化を定義
- [`set--var:hov`](../set-class.md#set--varhov) — 親のホバー状態を子要素に伝播させる仕組み
