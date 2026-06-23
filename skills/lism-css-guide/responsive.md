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
          sm:480px                md:800px               lg:1120px
```

| BP | 値 | 効くタイミング |
|----|-----|----------------|
| `xs` | 0（無効） | （opt-in） |
| `sm` | 480px | sm 以上 |
| `md` | 800px | md 以上 |
| `lg` | 1120px | lg 以上 |
| `xl` | 0（無効） | （opt-in） |

**レスポンシブ対応の Property Class は、標準で `sm` / `md` / `lg` のすべてに対応。** どの Prop がレスポンシブ対応かは property-class.md の BP 列を参照。レスポンシブ非対応の Prop でブレイクポイント指定を使う場合は customize.md 参照の SCSS カスタマイズが必要です。

**`xs` / `xl` は opt-in**:
- デフォルト値は `0`（無効）で、CSS は出力されません。`lism.config.js` の `breakpoints` でサイズを与えると有効化されます（customize.md 参照）。
- 型（Lism コンポーネント）でも `sm` / `md` / `lg` のみがデフォルトで補完・許可されます。`xs` / `xl` を使う場合は `declare module 'lism-css'` で `BreakpointRegistry` を拡張して解禁します。

  ```ts
  // src/lism.d.ts など
  import 'lism-css';
  declare module 'lism-css' {
    interface BreakpointRegistry {
      xl: true; // 配列の 5 要素目 [..., xl] と { xl: ... } を解禁
      xs: true; // { xs: ... } を解禁（xs は配列記法では書けない）
    }
  }
  ```

- `xs` は配列記法では書けません（配列のインデックス → BP の対応が `[base, sm, md, lg, xl]` で固定のため）。オブジェクト記法（`{ xs: ... }`）でのみ指定します。`xl` は配列記法・オブジェクト記法の両方で利用できます。

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
// 配列形式: 位置は [base, sm, md, lg, xl] で固定（xs は配列記法では書けない）
<Box p={[20, 30, 40]} fz={['s', 'm', 'l']} />

// オブジェクト形式（xs を使う場合はこちら）
<Box p={{ base: '20', sm: '30', md: '40' }} />
```

出力される HTML:

```html
<div class="l--box -p:20 -p_sm -p_md -fz:s -fz_sm -fz_md"
     style="--p_sm: var(--s30); --p_md: var(--s40); --fz_sm: var(--fz--m); --fz_md: var(--fz--l)">
</div>
```

---

## Authoring時の確認ルール

### base値を必ず置く

BP専用値だけを書くと、BP未満で値が未指定になります。配列では先頭、オブジェクトでは`base`、HTMLでは`-{prop}:{value}`を必ず置きます。

| NG | OK |
|---|---|
| `<Box p={{ sm: 30 }}>` | `<Box p={{ base: '20', sm: '30' }}>` |
| `<div class="-p_sm" style="--p_sm:var(--s30)">` | `<div class="-p:20 -p_sm" style="--p_sm:var(--s30)">` |

### 冗長配列は圧縮する

前のBPと同じ値を繰り返さない。変わらないBPは`null`でスキップし、全BPで同じ値なら単一値にします。

| NG | OK |
|---|---|
| `fxd={['column', 'column', 'row']}` | `fxd={['column', null, 'row']}` |
| `p={['20', '20', '20']}` | `p="20"` |
| `cols={[1, 1, 3]}` | `cols={[1, null, 3]}` |

ただし、既存コードの型・生成仕様で`null`が使えない場合は既存パターンを優先します。レスポンシブ差分を誤って単一値化しないでください。

### container query運用では祖先`isContainer`を確認する

デフォルトではレスポンシブProperty Classは`@container`で発火します。レスポンシブ値を載せる要素の祖先に`isContainer`/`is--container`があるか確認してください。

```jsx
<Stack isContainer>
  <Box p={{ base: '20', md: '40' }}>...</Box>
</Stack>
```

`$is_container_query:0`などの設定でmedia query運用が確認できる場合は、`isContainer`祖先は必須ではありません。設定が不明な場合は、既存SCSS設定・`customize.md`・生成CSSを確認してから判断してください。

### `isContainer`を置く位置で挙動が変わる

`isContainer`を追加する位置はcontainer幅と発火タイミングを変えます。既存UIの見た目・UXが変わる可能性がある場合は⏸としてユーザー確認してください。特に、固定Gridを`cols={[1,2,3]}`へ変える提案は挙動変更として扱います。
