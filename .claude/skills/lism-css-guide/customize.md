# カスタマイズ

`lism-css` パッケージから読み込む CSS や、コンポーネントが受け付ける Props の挙動を上書きしてカスタマイズする方法をまとめます。

## TOC

- [`@layer` をオフにする](#layer-をオフにする)
- [SCSS でのカスタマイズ](#scss-でのカスタマイズ)
- [`lism.config.js` でのカスタマイズ](#lismconfigjs-でのカスタマイズ)
- [追加スタイルを読み込ませる方法](#追加スタイルを読み込ませる方法)

[詳細](https://lism-css.com/docs/customize/)

---

## `@layer` をオフにする

`lism-css/main.css` の代わりに `lism-css/main_no_layer.css` を読み込むだけで、`@layer` を使わない CSS に切り替えられます。

```js
// 通常
import 'lism-css/main.css';

// @layer なしのCSSを読み込む場合はこちら
import 'lism-css/main_no_layer.css';
```

`@layer` のオン・オフは SCSS 変数では管理されません。**読み込むファイル自体を切り替える**点に注意してください。


## SCSS でのカスタマイズ

`lism-css/scss/_setting.scss` で定義された変数を `@use ... with (...)` で上書きできます。
上書き定義をしてから `lism-css/scss/main.scss` を読み込むことでカスタマイズが反映されます。

ソース: [`_setting.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/_setting.scss)

### 上書き可能な変数

| 変数 | 用途 | デフォルト |
|------|------|-----------|
| `$breakpoints` | ブレイクポイント数値の定義 | `('sm': '480px', 'md': '800px', 'lg': '1120px')` |
| `$common_support_bp` | 主要な Property Class が共通サポートするブレイクポイント上限 | `'md'` |
| `$is_container_query` | コンテナクエリで出力するか（`1` = container query, `0` = media query） | `1` |
| `$default_important` | Property Class にデフォルトで `!important` を付与するか | `0` |
| `$props` | Property Class ごとの個別出力設定 | `prop-config` のデフォルト |

### 基本フォーマット

```scss
// 1. 設定変数を上書き
@use '../path-to/node_modules/lism-css/scss/setting' with (
  $breakpoints: (
    'sm': '400px',  // 個別キーの上書き可
  ),
  $common_support_bp: 'lg',
  $is_container_query: 0,
  $default_important: 1,
  $props: (
    // 個別 Prop の設定（後述）
  )
);

// 2. main.scss を読み込む（@layer なしにする場合は main_no_layer）
@use '../path-to/node_modules/lism-css/scss/main';
```

> Astro の場合、`../path-to/node_modules/` 部分は不要で `lism-css/scss/setting` のように書けます。

### `$props` の個別カスタマイズ

各 Property Class について、出力範囲やユーティリティクラスを追加できます。

```scss
@use '../path-to/node_modules/lism-css/scss/setting' with (
  $props: (
    'fz': (
      important: 1,        // .-fz:* に !important を付与
    ),
    'h': (
      bp: 0,               // .-h_sm 等のブレイクポイント版を出力しない
    ),
    'p': (
      bp: 'lg',            // .-p_sm / .-p_md / .-p_lg まで出力
      utilities: (
        'box': '2em',      // .-p:box { --p: 2em } を追加
      ),
    ),
  )
);
@use '../path-to/node_modules/lism-css/scss/main';
```

### 注意点

SCSS を直接読み込む構成では、コンパイル時に `lism-css` 本体 CSS と読み込み順がずれる可能性があります。意図しない上書きが起きないよう、レイヤー順を確認してください。


## `lism.config.js` でのカスタマイズ

プロジェクトのルート直下に `lism.config.js` を置くことで、**コンポーネントの挙動**（受け付ける props の値や、出力されるクラス名）をカスタマイズできます。

> **注意**: `lism.config.js` は HTML 出力（クラス名）を変えるだけで、追加されたクラスに対する CSS は別途読み込ませる必要があります（[追加スタイルを読み込ませる方法](#追加スタイルを読み込ませる方法) を参照）。

### フォーマット

```js
// lism.config.js
export default {
  props: {
    // Property Class の出力をカスタマイズ
  },
  tokens: {
    // トークン値を追加
  },
  traits: {
    // Trait Primitive 用の props を追加
  },
};
```

デフォルト値は以下を参照：

- props: [`config/defaults/props.ts`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/config/defaults/props.ts)
- tokens: [`config/defaults/tokens.ts`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/config/defaults/tokens.ts)
- traits: [`config/defaults/traits.ts`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/config/defaults/traits.ts)

### カスタマイズ例

```js
// lism.config.js
import DEFAULT_CONFIG from 'lism-css/default-config';
const { props, tokens } = DEFAULT_CONFIG;

export default {
  props: {
    d: { presets: [...(props.d.presets || []), 'flex', 'grid'] },
    p: { utils: { box: '2em' } },
  },
  tokens: {
    bdrs: [...(tokens.bdrs || []), '5'],
  },
  traits: {
    isHoge: 'is--hoge',
  },
};
```

これによってコンポーネント側で次のような挙動が追加されます：

| 入力 | 出力されるクラス |
|------|----------------|
| `d="flex"` | `-d:flex` |
| `d="grid"` | `-d:grid` |
| `p="box"` | `-p:box` |
| `bdrs="5"` | `-bdrs:5` |
| `isHoge` | `is--hoge` |

```jsx
<Box p="box" d="flex" bdrs="5" isHoge>Box</Box>
// → <div class="l--box is--hoge -p:box -d:flex -bdrs:5">Box</div>
```


## 追加スタイルを読み込ませる方法

`lism.config.js` で props を増やしただけでは、対応するユーティリティクラスのスタイルは存在しません。次のいずれかでスタイルを追加してください。

### 1. CLI コマンドで CSS を再ビルド

```bash
npx lism-css build
```

`lism.config.js` の内容に基づいて `lism-css/main.css` を再生成します。上記カスタマイズ例だと、以下のスタイルが自動生成されます：

```css
.-d\:flex { display: flex; }
.-d\:grid { display: grid; }
.-p\:box { padding: 2em; }
.-bdrs\:5 { border-radius: var(--bdrs--5); }
```

> **注意**:
> - トークン CSS 変数（例: `--bdrs--5`）と `is--*` クラスのスタイルは自動生成されないため、手動で追加してください。
> - `lism-css` パッケージ自体を上書きする処理のため、**パッケージ更新ごとに再実行**が必要です。

### 2. 手動で CSS を追記

CLI を使わず、追加クラス分の CSS をプロジェクト側で書いて読み込ませる方法でも問題ありません。

```css
:root { --bdrs--5: 0.125rem; }
.is--hoge { /* ... */ }
```

### 3. SCSS で `lism.config.js` と整合させる

SCSS 経由で読み込む構成なら、`lism.config.js` と同じ追加分を `$props` の `utilities` 設定として書いておけば、ビルドコマンドなしで反映できます。

```scss
@use '../path-to/node_modules/lism-css/scss/setting' with (
  $props: (
    'd': (
      utilities: (
        'flex': 'flex',
        'grid': 'grid',
      ),
    ),
    'p': ( utilities: ( 'box': '2em' ) ),
    'bdrs': ( utilities: ( '5': 'var(--bdrs--5)' ) ),
  )
);
@use '../path-to/node_modules/lism-css/scss/main';

// トークン追記
@layer lism-base {
  :root { --bdrs--5: 0.125rem; }
}
```
