# `set--` クラス

`@layer lism-base` に属し、HTML 要素の基礎スタイリングまたは CSS 変数のセットアップだけを行うクラス群です。
HTML では直接クラスを付与し、Lism コンポーネントでは `set` prop（`set="plain"`, `set="revert"`, `set="var:bxsh"` 等）で指定します。

`set` prop の記法（複数値指定・`-` prefix による除外）は [components-core.md](./components-core.md#共通-props) を参照してください。

set-- は目的別に 2 カテゴリに分かれます。

| カテゴリ | 用途 | クラス |
|---------|------|--------|
| 基礎スタイリング | HTML 要素のリセット／リバート | `set--plain` / `set--revert` |
| 変数のセット | CSS 変数のセットアップのみを行う | `set--var:bxsh` / `set--var:hov` / `set--var:bdrsInner` |

`set--var:{name}` の `{name}` は、そのクラスがセットアップする CSS 変数の名称に対応します（例: `--bxsh--*` → `var:bxsh`、`--_isHov` / `--_notHov` → `var:hov`、`--bdrs--inner` → `var:bdrsInner`）。

## TOC

- [`set--plain`](#set--plain)
- [`set--revert`](#set--revert)
- [`set--var:bxsh`](#set--varbxsh)
- [`set--var:hov`](#set--varhov)
- [`set--var:bdrsInner`](#set--varbdrsinner)

[詳細](https://lism-css.com/docs/set-class/)

---

## 対応ソースコード

ソース: https://github.com/lism-css/lism-css/tree/main/packages/lism-css/src/scss/base/set

| クラス | ソースファイル |
|--------|---------------|
| `set--plain` | [`_plain.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/base/set/_plain.scss) |
| `set--revert` | [`_revert.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/base/set/_revert.scss) |
| `set--var:bxsh` | [`_shadow.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/base/tokens/_shadow.scss) |
| `set--var:hov` | [`_hov.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/base/set/_hov.scss) |
| `set--var:bdrsInner` | [`_bdrsInner.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/base/set/_bdrsInner.scss) |

---

## `set--plain`

`width`, `color`, `font`, `padding`, `border` など、ブラウザデフォルトスタイルを完全にリセットします。
ボタン・リンク等のスタイリング時に活用します。

使用例:
```html
<button class="set--plain">...</button>
```
```jsx
<Lism as="button" set="plain">...</Lism>
```

## `set--revert`

ブラウザデフォルトの見た目を明示的に復活させるためのクラスです。
これ単体ではスタイルは持ちません（全プロパティをrevertするというようなものではない）。

特定のHTML要素と組み合わせてスタイルを定義して使うものであり、現状は `ul` / `ol` のみ対象です。

Lism CSSでは、クラスを持つリスト（`ul` / `ol`）ではスタイルがリセットされます。
クラスを持ちつつ、箇条書き表示を維持したい場合（Property Class しか持たないリストなど）に `set--revert` を付与します。


使用例:
```html
<ul class="-fz:l set--revert">
  <li>item 1</li>
  <li>item 2</li>
</ul>
```
```jsx
<Lism as="ul" fz="l" set="revert">
  <li>item 1</li>
  <li>item 2</li>
</Lism>
```

## `set--var:bxsh`

`SHADOW` トークン変数（`--bxsh--{N}`）を再計算するためのクラスです。`:root` で定義される `--shc`（影の色）を特定要素で上書きしたい時に利用します。

使用例:
```html
<div class="l--box set--var:bxsh -bxsh:20" style="--shc: hsl(200 50% 50% / 20%)">...</div>
```
```jsx
<Box set="var:bxsh" bxsh='20' style={{ '--shc': 'hsl(200 50% 50% / 20%)' }}>...</Box>
```


## `set--var:hov`

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
  opacity: var(--_notHov, var(--o--pp)); /* 非hover時は不透明度を下げる（hover時は無効な値） */
}
```

さらに、親要素に`set--var:hov`を付与してその子要素で`--_isHov`変数と`--_notHov`変数を使うことで、親要素のhoverをトリガーとして子要素のスタイルを変化させることも可能になります。

例えば、親のボックスがhoverされたら、その内部の画像をズームするようなケースで活用でき、`-hov:in:zoom`クラスが標準で用意されています。

```html
<a href="###" class="l--frame set--var:hov is--boxLink -ar:21/9 -ov:hidden">
  <img class="has--transition -hov:in:zoom" src="https://cdn.lism-css.com/img/a-2.jpg" width="960" height="640" loading="lazy" />
  <div class="is--layer -bgc" style="--c: #fff; --bgc: rgb(0 0 0 / 50%)"></div>
  <div class="l--center is--layer -c" style="--c: #fff;">
    <span class="-fz:xl">バナーリンク</span>
  </div>
</a>
```

```css
.-hov\:in\:zoom {
  --transitionProps: scale;
  scale: var(--_isHov, 1.1);
}
```


## `set--var:bdrsInner`

親要素の角丸(`--bdrs`)とPadding(`--p`)の値から、その内側の角丸（`--bdrs--inner`）を自動計算するためのクラスです。
親要素に`set--var:bdrsInner`をクラスをセットし、子要素では`-bdrs:inner`をセットすることで、計算された`--bdrs--inner`をセットすることができます。

（親要素では`bdrs`と`p`の指定が必須となります。）

使用例:
```html "set--var:bdrsInner" "-bdrs:inner"
<div class="set--var:bdrsInner -p:15 -bdrs:40 -bd">
  <div class="-bdrs:inner">...</div>
</div>
```
```jsx
<Lism set="var:bdrsInner" p="15" bdrs="40" bd>
  <Lism bdrs="inner">...</Lism>
</Lism>
```
