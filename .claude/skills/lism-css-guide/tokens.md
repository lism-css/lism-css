# デザイントークン

Lism CSS では、余白・フォントサイズ・カラーなどの主要なCSSプロパティに対してデザイントークンを定義しています。
トークン値は CSS 変数にマッピングされ、Props やユーティリティクラスから参照できます。

CSSコードを書く場合やコンポーネントのPropsに値を指定する際は、明確な意図がない限りは固定値のハードコーディングを避け、デザイントークンの値を優先して使用してください。

## TOC

- [トークン概要テーブル](#トークン概要テーブル)
- [余白 (space)](#余白-space)
- [フォントサイズ (fz)](#フォントサイズ-fz)
- [行間 (lh/hl)](#行間-lhhl)
- [字間 (lts)](#字間-lts)
- [フォント (ff)](#フォント-ff)
- [ウェイト (fw)](#ウェイト-fw)
- [透明度 (o)](#透明度-o)
- [角丸 (bdrs)](#角丸-bdrs)
- [影 (bxsh)](#影-bxsh)
- [カラー](#カラー)
- [トークン値の命名規則](#トークン値の命名規則)

[詳細](https://lism-css.com/docs/tokens/)

---

## トークン概要テーブル

| カテゴリ | トークン値 | CSS変数パターン | 例 |
|---|---|---|---|
| 余白 (space) | `5`, `10`, `15`, `20`, `30`, `40`, `50`, `60`, `70`, `80` | `--s{n}` | `--s20` |
| フォントサイズ (fz) | `root`, `base`, `2xs`, `xs`, `s`, `m`, `l`, `xl`, `2xl`, `3xl`, `4xl`, `5xl` | `--fz--{key}` | `--fz--l` |
| ハーフレディング・行間 (lh/hl) | `base`, `xs`, `s`, `l` | `--hl--{key}` | `--hl--s` |
| 字間 (lts) | `base`, `s`, `l` | `--lts--{key}` | `--lts--s` |
| フォント (ff) | `base`, `accent`, `mono` | `--ff--{key}` | `--ff--mono` |
| ウェイト (fw) | `light`, `normal`, `bold` | `--fw--{key}` | `--fw--bold` |
| 透明度 (o) | `-10`, `-20`, `-30` | `--o--n{n}` | `--o--n10` |
| 角丸 (bdrs) | `10`, `20`, `30`, `40`, `99`, `inner` | `--bdrs--{key}` | `--bdrs--20` |
| 影 (bxsh) | `10`, `20`, `30`, `40` | `--bxsh--{n}` | `--bxsh--20` |
| サイズ (sz) | `xs`, `s`, `m`, `l`, `xl`, `min`, `full`, `container` | `--sz--{key}` | `--sz--l` |
| アスペクト比 (ar) | `og` | `--ar--{key}` | `--ar--og` |
| 書字方向 (writing) | `vertical` | `--writing--{key}` | `--writing--vertical` |
| フロー余白 (flow) | `s`, `l` | `--flow--{key}` | `--flow--s` |
| セマンティックカラー (c) | `base`, `base-2`, `text`, `text-2`, `divider`, `link`, `brand`, `accent` | `--{name}` | `--brand` |
| パレットカラー (palette) | `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `gray`, `white`, `black` | `--{name}` | `--red` |


---


## 余白 (space)

フィボナッチ数列ベースのスケーリング。`--s-unit`（≒ 8px）を基準単位とする。

| CSS変数 | 値 | 実サイズ目安 |
|---------|-----|------------|
| `--s5` | `calc(0.5 * var(--s-unit))` | ≒ 4px |
| `--s10` | `var(--s-unit)` | ≒ 8px |
| `--s15` | `calc(1.5 * var(--s-unit))` | ≒ 12px |
| `--s20` | `calc(2 * var(--s-unit))` | ≒ 16px |
| `--s30` | `calc(3 * var(--s-unit))` | ≒ 24px |
| `--s40` | `calc(5 * var(--s-unit))` | ≒ 40px |
| `--s50` | `calc(8 * var(--s-unit))` | ≒ 64px |
| `--s60` | `calc(13 * var(--s-unit))` | ≒ 104px |
| `--s70` | `calc(21 * var(--s-unit))` | ≒ 168px |
| `--s80` | `calc(34 * var(--s-unit))` | ≒ 272px |

係数 `0.5, 1, 1.5, 2, 3, 5, 8, 13, 21, 34` はフィボナッチ数列に基づいている。`--s-unit` を上書きすることでスケール全体を調整可能。


## フォントサイズ (fz)

倍音列（調和数列）ベースの、ハーモニックモジュラースケーリングを採用。`--fz-mol`（デフォルト `8`）を分子とする `mol / (mol ± n)` の比率で算出される。

| CSS変数 | 値 | 説明 |
|---------|-----|------|
| `--fz--5xl` | `calc(1em * var(--fz-mol) / (var(--fz-mol) - 6))` | 最大（mol/(mol-6)） |
| `--fz--4xl` | `calc(1em * var(--fz-mol) / (var(--fz-mol) - 5))` | 特大（mol/(mol-5)） |
| `--fz--3xl` | `calc(1em * var(--fz-mol) / (var(--fz-mol) - 4))` | 3XL（mol/(mol-4)） |
| `--fz--2xl` | `calc(1em * var(--fz-mol) / (var(--fz-mol) - 3))` | 2XL（mol/(mol-3)） |
| `--fz--xl` | `calc(1em * var(--fz-mol) / (var(--fz-mol) - 2))` | XL（mol/(mol-2)） |
| `--fz--l` | `calc(1em * var(--fz-mol) / (var(--fz-mol) - 1))` | L（mol/(mol-1)） |
| `--fz--m` | `1em` | M（基準） |
| `--fz--s` | `calc(1em * var(--fz-mol) / (var(--fz-mol) + 1))` | S（mol/(mol+1)） |
| `--fz--xs` | `calc(1em * var(--fz-mol) / (var(--fz-mol) + 2))` | XS（mol/(mol+2)） |
| `--fz--2xs` | `calc(1em * var(--fz-mol) / (var(--fz-mol) + 3))` | 最小（mol/(mol+3)） |
| `--fz--base` | `var(--REM)` | 本文の基本フォントサイズ（≒ 1rem） |
| `--fz--root` | — | `:root` のフォントサイズ |

`--fz-mol` を上書きすることでスケール全体を調整可能（7以上の値に対応）。


## 行間 (lh/hl)

ハーフレディングの大きさ。Lism CSSでは、`line-height` は `calc(1em + var(--hl) * 2)` で算出される。`--hl-unit`（≒ 2px）を基準単位とする。

| CSS変数 | 値 | 説明 |
|---------|-----|------|
| `--hl--xs` | `var(--hl-unit)` | 極小の行間（≒ 2px） |
| `--hl--s` | `calc(var(--hl-unit) * 2)` | 小さめの行間（≒ 4px） |
| `--hl--base` | `calc(var(--hl-unit) * 3)` | 基本の行間（≒ 6px） |
| `--hl--l` | `calc(var(--hl-unit) * 4)` | 大きめの行間（≒ 8px） |


## 字間 (lts)

| CSS変数 | 値 | 説明 |
|---------|-----|------|
| `--lts--base` | `normal` | 基本の文字間隔 |
| `--lts--s` | `-0.05em` | 狭めの文字間隔 |
| `--lts--l` | `0.05em` | 広めの文字間隔 |


## フォント (ff)

| CSS変数 | 値 |
|---------|-----|
| `--ff--base` | `-apple-system, 'BlinkMacSystemFont', 'Hiragino Sans', sans-serif, 'Segoe UI Emoji'` |
| `--ff--accent` | `'Garamond', 'Baskerville', 'Times New Roman', serif` |
| `--ff--mono` | `ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace` |


## ウェイト (fw)

| CSS変数 | 値 | 説明 |
|---------|-----|------|
| `--fw--light` | `300` | 細め |
| `--fw--normal` | `400` | 標準 |
| `--fw--bold` | `600` | 太字（Hiragino Sans W6 相当） |

数値ユーティリティ: `-fw:100` 〜 `-fw:900` も使用可能。


## 透明度 (o)

| CSS変数 | 値 | 説明 |
|---------|-----|------|
| `--o--n10` | `0.75` | 75%の不透明度 |
| `--o--n20` | `0.5` | 50%の不透明度 |
| `--o--n30` | `0.25` | 25%の不透明度 |


## 角丸 (bdrs)

| CSS変数 | 値 | 説明 |
|---------|-----|------|
| `--bdrs--10` | `0.25rem` | ≒ 4px |
| `--bdrs--20` | `0.5rem` | ≒ 8px |
| `--bdrs--30` | `1rem` | ≒ 16px |
| `--bdrs--40` | `1.5rem` | ≒ 24px |
| `--bdrs--99` | `99rem` | 完全な丸（pill） |
| `--bdrs--inner` | `calc(var(--bdrs, 0px) - var(--p, 0px))` | 内側の角丸（親要素に合わせる） |


## 影 (bxsh)

`--shc`（シャドウカラー: `hsl(220 4% 8% / 5%)`）と `--shsz--{n}`（シャドウサイズ）を組み合わせた複合シャドウ。使用時は `set--shadow` クラスの併用が必要（影色 `--shc` の再計算のため）。

| CSS変数 | 値 | 説明 |
|---------|-----|------|
| `--bxsh--10` | `var(--sh--5), var(--sh--10)` | step 10 |
| `--bxsh--20` | `var(--sh--10), var(--sh--20)` | step 20 |
| `--bxsh--30` | `var(--sh--20), var(--sh--30)` | step 30 |
| `--bxsh--40` | `var(--sh--30), var(--sh--40)` | step 40（最も濃い） |


## カラー

### セマンティックカラー

サイト全体のカラー設計に使用するトークン。

| CSS変数 | デフォルト値 | 説明 |
|---------|------------|------|
| `--base` | `hsl(224 4% 99%)` | ベース背景色 |
| `--base-2` | `hsl(224 8% 95%)` | 代替背景色 |
| `--text` | `hsl(224 4% 8%)` | 基本テキスト色 |
| `--text-2` | `hsl(224 6% 32%)` | 補助テキスト色 |
| `--divider` | `hsl(224 8% 88%)` | 区切り線色 |
| `--link` | `oklch(50% 0.3 240)` | リンク色 |
| `--brand` | `#1e5f8c` | ブランド色 |
| `--accent` | `#d94a6a` | アクセント色 |

### パレットカラー

OKLCH で定義されたカラーパレット。`--L`（明度）と `--C`（彩度）の基準値を調整するとパレット全体の色味を変更可能。デフォルト: `--L: 60%`, `--C: 0.22`。

| CSS変数 | 値 |
|---------|-----|
| `--red` | `oklch(var(--L) var(--C) 20)` |
| `--orange` | `oklch(calc(var(--L) + 4%) calc(var(--C) - 0.01) 52)` |
| `--yellow` | `oklch(calc(var(--L) + 12%) calc(var(--C) - 0.025) 84)` |
| `--green` | `oklch(calc(var(--L) + 4%) calc(var(--C) - 0.02) 152)` |
| `--blue` | `oklch(calc(var(--L) - 2%) calc(var(--C) + 0.01) 260)` |
| `--purple` | `oklch(calc(var(--L) - 4%) calc(var(--C) + 0.02) 292)` |
| `--pink` | `oklch(calc(var(--L) + 2%) calc(var(--C) + 0.02) 348)` |
| `--gray` | `oklch(calc(var(--L) - 4%) 0.04 256)` |
| `--black` | `#000` |
| `--white` | `#fff` |

- `c`, `bgc` 等のカラー系 Props では、セマンティックカラー → パレットカラーの順で検索される
- どちらも最終的に `var(--{name})` に変換される


## トークン値の命名規則

1. **`s`, `m`, `l`, `xl` 等のサイズ表記** — ベース値（`base` or `m`）があり、それに対する大小を表すトークン
   - `:root`/`body` にセットされている値に戻すものは `base`、そうでない中心値は `m`
2. **`10`, `20`, `30` 等の数値表記** — `0`（`none`）が基準で、段階的に値を持つトークン
3. **セマンティック名** — プロパティ固有の意味を持つ名前（例: `--ar--og`, `--ff--mono`など）
