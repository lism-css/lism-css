# -hov（ホバー）

hover 時の挙動を制御する Property Class。`:hover` 擬似クラスで動作する系と、親の `set--var:hov` に連動する系の 2 系統に分かれる。

## 基本情報

- クラス名: `-hov:-{prop}` / `-hov:{preset}` / `-hov:in:{preset}`
- Lism props: `hov`（`<Lism hov="-c">` / `<Box hov={{ bgc: 'brand' }}>` 等）
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/props/_hover.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/property-class/hov/

## 3 つの形式

| 形式 | 役割 |
|------|------|
| `.-hov:-{prop}` | `--hov-{prop}` 変数を受け取り、hover 時に該当プロパティを変化させる |
| `.-hov:{preset}` | hover 時のスタイルセットをプリセット名でまとめて適用する |
| `.-hov:in:{preset}` | 親要素の `set--var:hov` を起点に、子要素のスタイルを変化させる |

`-hov:-{prop}` と `-hov:{preset}` は `@media (any-hover: hover)` 内で定義されるため、タッチデバイスでは無効。  
`-hov:in:*` はメディアクエリ外で、親の `set--var:hov` がセットする `--_isHov` / `--_notHov` 変数で動作する。

トランジションを付けたい場合は [`has--transition`](../trait-class/has--transition.md) クラスを併用する。

## `.-hov:-{prop}` — プロパティ変更

`:hover` で直接動作する。クラスを付けるだけで初期値で変化する。

| クラス | 変化するプロパティ | 初期値 |
|--------|----------------------|--------|
| `.-hov:-c` | `color` | `var(--hov-c, var(--link))` |
| `.-hov:-bdc` | `border-color` | `var(--hov-bdc, currentColor)` |
| `.-hov:-bgc` | `background-color` | `var(--hov-bgc, var(--base-2))` |
| `.-hov:-o` | `opacity` | `var(--hov-o, var(--o--p))` |
| `.-hov:-bxsh` | `box-shadow` | `var(--hov-bxsh, var(--bxsh--50))` |

任意の値へ変化させたい場合は、`--hov-{prop}` 変数で値を指定する。

```html
<!-- 初期値のまま使用 -->
<a class="is--boxLink -hov:-o -bgc:base-2 -bd -p:20" href="###">...</a>

<!-- 任意値を指定 -->
<a class="is--boxLink -hov:-bgc -hov:-c -bgc:base-2 -p:20"
   style="--hov-bgc: var(--brand); --hov-c: var(--white)" href="###">...</a>
```

## `.-hov:{preset}` — プリセット

hover 時のスタイルセットをプリセット名でまとめて適用する。

| クラス | 内容 |
|--------|------|
| `.-hov:underline` | テキストに下線を表示 |
| `.-hov:neutral` | 背景色にニュートラルグレーをブレンド |

プロジェクト固有のプリセットは、以下のように自作して追加できる。

```scss
@media (any-hover: hover) {
  .-hov\:shadowUp:hover {
    box-shadow: var(--bxsh--40);
    translate: 0 -3px;
  }
}
```

## `.-hov:in:{preset}` — 親連動

親要素に `set--var:hov` を付けると、`--_isHov` / `--_notHov` 変数が hover 状態に応じて切り替わる。`-hov:in:*` はこの変数を参照する仕組み。

| クラス | 効果 | 仕組み |
|--------|------|--------|
| `.-hov:in:hide` | 親 hover 時にフェードアウト | `opacity: var(--_isHov, 0)` |
| `.-hov:in:show` | 親 hover 時にフェードイン | `opacity: var(--_notHov, 0)` / `visibility: var(--_notHov, hidden)` |
| `.-hov:in:zoom` | 親 hover 時にズーム | `scale: var(--_isHov, 1.1)` |

```jsx
<Frame set="var:hov" isBoxLink href="#" ar="16/9">
  <Media isLayer hasTransition hov="in:zoom" src="..." />
  <Layer hasTransition hov="in:show" bgc="rgb(0 0 0 / 40%)">...</Layer>
</Frame>
```

## `<Lism>` コンポーネントでの `hov` 指定

`<Lism>`（およびその継承コンポーネント）の `hov` prop は、文字列・オブジェクトの 2 通りで指定できる。

### 文字列指定

入力した文字列がそのまま `-hov:{入力文字列}` クラスとして出力される。カンマ区切りで複数指定可能。**自動変換は行われない**（`"c"` → `-hov:-c` のような省略はサポートしない）。

```jsx
<Lism hov="-o">...</Lism>
// → <div class="-hov:-o">...</div>

<Lism hov="shadowUp">...</Lism>
// → <div class="-hov:shadowUp">...</div>

<Lism hov="-c,-bxsh">...</Lism>
// → <div class="-hov:-c -hov:-bxsh">...</div>
```

### オブジェクト指定

主に `.-hov:-{prop}` に任意の値を渡す用途。`hov={{ prop: value }}` で `-hov:-{prop}` クラス + `--hov-{prop}` 変数を出力。

```jsx
<Lism hov={{ c: 'red' }}>...</Lism>
// → <div class="-hov:-c" style="--hov-c: var(--red)">...</div>
```

値に `true` を指定すると `-hov:{key}` クラスのみ出力される。任意値プロップとプリセット／自作クラスを**同時に**指定したい時に使う。

```jsx
<Lism hov={{ shadowUp: true }}>...</Lism>
// → <div class="-hov:shadowUp">...</div>

<Lism hov={{ c: 'red', shadowUp: true }}>...</Lism>
// → <div class="-hov:-c -hov:shadowUp" style="--hov-c: var(--red)">...</div>
```

## `has--transition` との併用

`-hov:*` による変化は即時に切り替わる。なめらかなトランジションを付けたい場合は `has--transition` を併用し、`--duration` で所要時間を調整する。

```jsx
<BoxLink href="###" hasTransition bxsh="10" hov={{ bxsh: '40' }} bd p="20">...</BoxLink>
// → <a class="is--boxLink has--transition -bxsh:10 -hov:-bxsh -bd -p:20"
//      style="--hov-bxsh: var(--bxsh--40)" href="###">...</a>

<BoxLink href="###" hasTransition hov={{ bdc: 'red' }} bd p="20"
         style={{ '--duration': '.5s' }}>...</BoxLink>
```

## 関連

- [`has--transition`](../trait-class/has--transition.md) — hover 時の変化にトランジションを付ける
- [`set--var:hov`](../set-class.md#set--varhov) — 親の hover 状態を子要素に伝播させる仕組み
- [`set--var:bxsh`](../set-class.md) — `-hov:-bxsh` と組み合わせる場合の影色再計算
