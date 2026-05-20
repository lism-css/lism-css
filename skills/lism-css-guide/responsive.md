# レスポンシブ対応

Lism CSS は**コンテナクエリ**をデフォルトで採用しています（メディアクエリへの切り替えは customize.md を参照）。

## TOC

- [ブレイクポイント](#ブレイクポイント)
- [HTML / Property Class での指定](#html--property-class-での指定)
- [Lism コンポーネントでの指定](#lism-コンポーネントでの指定)

[詳細](https://lism-css.com/docs/responsive/)

---

## ブレイクポイント

**モバイルファースト**で定義。各ラベルは「**そのサイズを超えた時から効く**」セマンティクスです（`sm` は「スマホ専用」ではなく「`sm` を超えたサイズで効く」ラベル）。**特定デバイスサイズに依存しないシンプルな閾値**を採用しています。

```
Smartphone ──┬── Tablet (Portrait) ──┬── Tablet (Landscape) ──┬── Laptop and up
             │                       │                        │
          sm:480px                md:800px               (lg:1120px)
```

| BP | 値 | 効くタイミング |
|----|-----|----------------|
| `sm` | 480px | sm 以上 |
| `md` | 800px | md 以上 |
| (`lg`) | 1120px | lg 以上 |

**レスポンシブ対応の Property Class は、基本的に標準では `sm` / `md` まで対応。** ただし `d`（display）/ `g`（gap）/ `cols` / グリッド系（`gta` `gtc` `gtr` `ga` `gc` `gr`）など、大枠のレイアウト構造に関わる一部のプロパティは `lg` まで対応。それ以外のプロパティで `lg` 以降を使う場合は customize.md 参照の SCSS カスタマイズが必要です。

例: `-d:none -d_sm:block` → デフォルト非表示、`sm` 以上で表示。

### SCSS から利用する

ブレイクポイント自体を SCSS で参照する場合は `query` モジュール経由:

```scss
@use 'lism-css/scss/query' as query;

@include query.bp-up('sm') {
  // sm 以上で効くスタイル（width >= 480px）
}
@include query.bp-up('md') {
  // md 以上で効くスタイル（width >= 800px）
}
```

## HTML / Property Class での指定

ブレイクポイント用のクラス `-{prop}_{bp}` と CSS変数 `--{prop}_{bp}` を組み合わせます。

```html
<!-- sm 以上で p:30, md 以上で p:40 に切り替え -->
<div class="-p:20 -p_sm -p_md" style="--p_sm: var(--s30); --p_md: var(--s40)">
  ...
</div>

<!-- sm 以上で fz を l に切り替え -->
<div class="-fz:s -fz_sm" style="--fz_sm: var(--fz--l)">
  ...
</div>
```

**仕組み:**
- BPクラス `-{prop}_{bp}` は `@container (min-width: ...)` 内で発火し、`--{prop}_{bp}` 変数で切り替え先の値を指定
- コンテナクエリ採用のため、レスポンシブ値を使うには祖先要素に `is--container` などコンテナ宣言が必要
- 出力形式はプロパティによって 2 パターン（基本 / 例外）

**基本パターン** — BP 用変数を直接読む:

```css
.-d { display: var(--d) }
@container (min-width: 480px) {
  .-d_sm { display: var(--d_sm) }
}
@container (min-width: 800px) {
  .-d_md { display: var(--d_md) }
}
```

**例外パターン** — `alwaysVar` 対応の `c`, `bgc`, `p`, `m`, `bdrs` のみ。ベース変数 `--p` が常に現在適用中の値を指すように上書きされる（state 変数扱い）:

```css
.-p { padding: var(--p) }
@container (min-width: 480px) {
  .-p_sm { padding: var(--p); --p: var(--p_sm) !important }
}
@container (min-width: 800px) {
  .-p_md { padding: var(--p); --p: var(--p_md) !important }
}
```

ソースコードの [props.ts](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/config/defaults/props.ts) で `alwaysVar: 1` がセットされているプロパティがこのパターンで出力されます。

## Lism コンポーネントでの指定

配列形式またはオブジェクト形式でレスポンシブ値を指定します。

```jsx
// 配列形式: [デフォルト, sm, md]
<Box p={[20, 30, 40]} fz={['s', 'm', 'l']} />

// オブジェクト形式
<Box p={{ base: '20', sm: '30', md: '40' }} />
```

出力される HTML:

```html
<div class="l--box -p:20 -p_sm -p_md -fz:s -fz_sm -fz_md"
     style="--p_sm: var(--s30); --p_md: var(--s40); --fz_sm: var(--fz--m); --fz_md: var(--fz--l)">
</div>
```
