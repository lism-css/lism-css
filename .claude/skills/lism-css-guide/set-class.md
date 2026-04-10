# `set--` クラス

`@layer lism-base` に属し、特定の機能を有効にするために CSS変数やベーススタイルをセットアップするクラス群です。
HTML では直接クラスを付与し、Lism コンポーネントでは `set` prop（`set="plain"`, `set="shadow"` 等）で指定します。

## TOC

- [`set--plain`](#set--plain)
- [`set--shadow`](#set--shadow)
- [`set--hov`](#set--hov)
- [`set--transition`](#set--transition)
- [`set--gutter`](#set--gutter)
- [`set--innerRs`](#set--innerrs)
- [`set--bp`](#set--bp)

[詳細](https://lism-css.com/docs/set/)

---

## 対応ソースコード

ソース: https://github.com/lism-css/lism-css/tree/main/packages/lism-css/src/scss/base/set

| クラス | ソースファイル |
|--------|---------------|
| `set--plain` | [`_plain.scss`](https://github.com/lism-css/lism-css/blob/main/packages/lism-css/src/scss/base/set/_plain.scss) |
| `set--shadow` | [`_shadow.scss`](https://github.com/lism-css/lism-css/blob/main/packages/lism-css/src/scss/base/tokens/_shadow.scss) |
| `set--hov` | [`_hov.scss`](https://github.com/lism-css/lism-css/blob/main/packages/lism-css/src/scss/base/set/_hov.scss) |
| `set--transition` | [`_transition.scss`](https://github.com/lism-css/lism-css/blob/main/packages/lism-css/src/scss/base/set/_transition.scss) |
| `set--gutter` | [`_gutter.scss`](https://github.com/lism-css/lism-css/blob/main/packages/lism-css/src/scss/base/set/_gutter.scss) |
| `set--innerRs` | [`_innerRs.scss`](https://github.com/lism-css/lism-css/blob/main/packages/lism-css/src/scss/base/set/_innerRs.scss) |
| `set--bp` | [`_bp.scss`](https://github.com/lism-css/lism-css/blob/main/packages/lism-css/src/scss/base/set/_bp.scss) |

---

## `set--plain`

`width`, `color`, `font`, `pading`, `border`など、ブラウザデフォルトスタイルを完全にリセットします。  
ボタン・リンク等のスタイリング時に活用します。

使用例:
```html
<button class="set--plain">...</button>
```
```jsx
<Lism as="button" set="plain">...</Lism>
```

## `set--shadow`

`SHADOW`トークン変数（`--bxsh--{token}`）を再計算するためのクラスです。`:root` で定義される `--shc`（影の色）を特定要素で上書きしたい時に利用します。

使用例:

```html
<div class="l--box set--shadow -bxsh:20" style="--shc: hsl(200 50% 50% / 20%)">...</div>
```
```jsx
<Box set="shadow" bxsh='20' style={{ '--shc': 'hsl(200 50% 50% / 20%)' }}>...</Box>
```



## `set--hov`

ホバー状態の判定変数（`--_notHov`, `--_isHov`）を次のようにセットします。主に**子要素のホバースタイルを制御する**時に活用します。

- `--_isHov`は非hover時（かつ非focus-within時）にのみ空白定義さます。
- `--_notHov`は逆に、hover時またはfocus-within時に空白定義されます。

この空変数トリックにより、次のような書き方ができます。

- `var(--_isHov, {ホバー時に適用させたい値})`
- `var(--_notHov, {非ホバー時に適用させたい値})`

（`var(--_isHov, ...) var(--_notHov, ...)`とするとホバー前後のスタイルを1行で書くこともできますが、`box-shadow`などの半角スペースで区切って値を調整するプロパティではこの書き方無効となります。）

使用例:

```html
<div class="-hov:test">...</div>
```
```css
.-hov\:test {
  color: var(--_isHov, green) var(--_notHov, red); /* hover時はgreen, 非hover時はred*/
  box-shadow: var(--_isHov, var(--bxsh--30)); /* hover時はshadowをつける（非hover時は無効な値） */
  opacity: var(--_notHov, var(--o--n20)); /* 非hover時は不透明度を下げる（hover時は無効な値） */
}
```

さらに、親要素に`set--hov`を付与してその子要素で`--_isHov`変数と`--_notHov`変数を使うことで、親要素のhoverをトリガーとして子要素のスタイルを変化させることも可能になります。

例えば、親のボックスがhoverされたら、その内部の画像をズームするようなケースで活用でき、`-hov:to:zoom`クラスが標準で用意されています。

```html
<a href="###" class="l--frame is--linkBox set--hov -ar:21/9 -ov:hidden">
  <img class="set--transition -hov:to:zoom" src="https://cdn.lism-css.com/img/a-2.jpg" width="960" height="640" loading="lazy" />
  <div class="is--layer -bgc" style="--c: #fff; --bgc: rgb(0 0 0 / 50%)"></div>
  <div class="l--center is--layer -c" style="--c: #fff;">
    <span class="-fz:xl">バナーリンク</span>
  </div>
</a>
```

```css
.-hov\:to\:zoom {
  --transProp: scale;
  scale: var(--_isHov, 1.1);
}
```


## `set--transition`

トランジション用の CSS をセットアップします。

```scss
.set--transition {
  transition: var(--hov-duration, 0.25s) var(--hov-ease, linear) var(--hov-delay, 0s);
  transition-property: var(--hov-prop, all);
}
```

| カスタム変数 | デフォルト |
|-------------|-----------|
| `--hov-prop` | `all` |
| `--hov-duration` | `0.25s` |
| `--hov-ease` | `linear` |
| `--hov-delay` | `0s` |

```html
<div class="set--transition -hov:c" style="--hov-prop: color; --hov-c: var(--red);">...</div>
```
```jsx
<Lism set="transition" hov={{c: 'red'}} style={{ '--hov-prop': 'color'}}>...</Lism>
```



## `set--gutter`

要素に左右パディングを適用します。`--gutter-size` のデフォルトは `var(--s30)` です。

```scss
.set--gutter {
  padding-inline: var(--gutter-size);
}
```

```html
<div class="set--gutter">...</div>
```
```jsx
<Lism set="gutter">...</Lism>
```


## `set--innerRs`

親要素の角丸(`--bdrs`)とPadding(`--p`)の値から、その内側の角丸（`--bdrs--inner`）を自動計算するためのクラスです。  
親要素に`set--innerRs`をクラスをセットし、子要素では`-bdrs:inner`をセットすることで、計算された`--bdrs--inner`をセットすることができます。

（親要素では`bdrs`と`p`の指定が必須となります。）

使用例:
```html "set--innerRs" "-bdrs:inner"
<div class="set--innerRs -p:15 -bdrs:40 -bd">
  <div class="-bdrs:inner">...</div>
</div>
```
```jsx
<Lism set="innerRs" p="15" bdrs="40" bd>
  <Lism bdrs="inner">...</Lism>
</Lism>
```


## `set--bp`

ブレークポイント判定用の hack 変数をセットします。コンテナクエリで各ブレークポイントを超えた時に空変数がセットされ、CSS の空変数トリックで条件分岐に使えます。
`sm`, `md`にのみ対応しています。（`--_is_sm`, `--_is_md`が定義されます。）

smサイズ以上でテキストカラーを赤に変える例:

```html
<div class="set--bp -p:20" style="color: var(--_is_sm) red">...</div>
```
```jsx
<Lism set="bp" p="20" style={{ color: 'var(--_is_sm) red;' }}>...</Lism>
```
