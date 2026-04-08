# ベーススタイリング

Lism CSS は `@layer lism-base` レイヤーで、Reset CSS・HTML要素のベーススタイル・CSS変数（トークン）を定義しています。

> ここでは概要を記載しています。トークンの具体的な値は [tokens.md](./tokens.md) を参照してください。


## Reset CSS

`@layer lism-base.reset` として定義される最小限のリセットスタイルです。

- `box-sizing: border-box` の全要素適用
- `margin: 0` の全要素適用（`<dialog>` を除く）
- `overflow: clip` を `<html>` に適用（横スクロール防止）
- `body` に `min-height: 100dvh`
- メディア要素（`img`, `video`, `iframe`）に `max-inline-size: 100%`, `block-size: auto`
- フォーム要素のフォント・カラー継承

- 詳細: https://lism-css.com/docs/base-styles/
- ソース: https://github.com/lism-css/lism-css/blob/dev/packages/lism-css/src/scss/reset.scss


## HTML 要素のベーススタイル

Reset CSS に加え、`@layer lism-base` 内で HTML タグに基本スタイルを適用しています。
その中で、専用のCSS変数を使って値を調整できるようにしている部分をここでは紹介します。具体的なスタイルの詳細は、githubのソースコードを読んでください。

### 全要素の行間

| 変数 | 用途 |
|------|------|
| `--hl` | half-leading（行間の上下余白量）。`line-height: calc(1em + var(--hl) * 2)` として全要素に適用 |

### body

| 変数 | 用途 |
|------|------|
| `--fz--base` | ベースフォントサイズ |
| `--ff--base` | ベースフォントファミリー |
| `--lts--base` | ベース字間 |
| `--text` | テキスト色 |
| `--base` | 背景色 |
| `--under-offset` | `text-underline-offset`（デフォルト: `0.125em`） |

### 見出し（h1〜h6）

| 変数 | 用途 |
|------|------|
| `--headings-ff` | 全見出し共通のフォントファミリー（デフォルト: `inherit`） |
| `--headings-fw` | 全見出し共通のフォントウェイト（デフォルト: `var(--fw--bold)`） |

各レベルのフォントサイズは `--fz--3xl`（h1）〜 `--fz--m`（h5, h6）がセットされている。

### リンク（a）

| 変数 | フォールバック | 用途 |
|------|------------|------|
| `--link-c` | `var(--link)` | リンクテキスト色 |
| `--link-td` | `underline` | テキスト装飾の種類 |
| `--link-td-thickness` | `auto` | 下線の太さ |
| `--link-td-color` | `currentColor` | 下線の色 |

### テーブル（table, td, th）

| 変数 | フォールバック | 用途 |
|------|------------|------|
| `--td-c` | `inherit` | セルのテキスト色 |
| `--td-bgc` | `transparent` | セルの背景色 |
| `--td-p` | `var(--s10)` | セルのパディング |
| `--td-min-sz` | `initial` | セルの最小幅 |
| `--th-c` | `var(--td-c)` | 見出しセルのテキスト色 |
| `--th-bgc` | `var(--td-bgc)` | 見出しセルの背景色 |
| `--th-p` | `var(--td-p)` | 見出しセルのパディング |
| `--th-min-sz` | `var(--td-min-sz)` | 見出しセルの最小幅 |

`th` は `td` の変数をフォールバックとして参照するため、`--td-*` だけで両方に反映される。

### フォーム要素

| 変数 | フォールバック | 用途 |
|------|------------|------|
| `--controls-bgc` | `var(--base-2)` | 背景色 |
| `--controls-bdc` | `var(--divider)` | ボーダー色 |
| `--controls-p` | `var(--s5) var(--s10)` | パディング |
| `--controls-bdrs` | `var(--bdrs--10)` | 角丸 |

### その他

| 変数 | 対象 | 用途 |
|------|------|------|
| `--focus-offset` | `:focus-visible` | アウトラインのオフセット（デフォルト: `0px`） |

- 詳細: https://lism-css.com/docs/base-styles/
- ソース: https://github.com/lism-css/lism-css/blob/dev/packages/lism-css/src/scss/base/_html.scss


## CSS 変数（トークン）

`:root` で定義されるデザイントークンの変数群です。値の詳細は [tokens.md](./tokens.md) を参照。

### サイズトークン

| 変数 | 値 | 用途 |
|------|-----|------|
| `--sz--xl` | `1600px` | コンテンツ幅プリセット |
| `--sz--l` | `1280px` | コンテンツ幅プリセット |
| `--sz--m` | `56rem` | デフォルトコンテンツ幅 |
| `--sz--s` | `42rem` | コンテンツ幅プリセット |
| `--sz--xs` | `32rem` | コンテンツ幅プリセット |
| `--sz--min` | `18rem` | 最小コンテンツサイズ |

### REM と余白

- `--REM`: `clamp(0.95rem, 0.915rem + 0.15vw, 1.05rem)` — ビューポート幅に応じた基本サイズ
- `--s-unit`: `calc(var(--REM) * 0.5)` — 余白の基本単位（約8px）
- `--s5` 〜 `--s80` — フィボナッチベースのスペーシングスケール
- `--hl`: half-leading 変数（`--hl--base` = `calc(var(--REM) * 0.125 * 2)` ≈ 4px）

### フォント

- `--fz--base` 〜 `--fz--5xl` / `--fz--2xs` — 調和級数ベースのフォントスケール
- `--ff--base`, `--ff--accent`, `--ff--mono` — フォントファミリー
- `--fw--light: 300`, `--fw--normal: 400`, `--fw--bold: 600`
- `--lts--base`, `--lts--s: -0.05em`, `--lts--l: 0.05em` — 字間

### その他の変数

- `--gutter-size: var(--s30)` — サイトコンテンツの左右パディング
- `--vertical-mode: vertical-rl` — 縦書きモード
- `--o--n10: 0.75`, `--o--n20: 0.5`, `--o--n30: 0.25` — 不透明度
- `--ar--og: 1.91/1` — OGP 画像のアスペクト比


`set--` クラスについては [set-class.md](./set-class.md) を参照してください。
