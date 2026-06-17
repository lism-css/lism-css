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
- [フロー余白 (flow)](#フロー余白-flow)
- [ガター (gutter)](#ガター-gutter)
- [カラー](#カラー)
- [トークン値の命名規則](#トークン値の命名規則)

[詳細](https://lism-css.com/docs/tokens.md)

---

## トークン概要テーブル

| カテゴリ | トークン値 | CSS変数パターン | 例 |
|---|---|---|---|
| 余白 (space) | `5`, `10`, `15`, `20`, `25`, `30`, `35`, `40`, `50`, `60`, `70`, `80` | `--s{N}` | `--s20` |
| フォントサイズ (fz) | `base`, `2xs`, `xs`, `s`, `m`, `l`, `xl`, `2xl`, `3xl`, `4xl`, `5xl` | `--fz--{key}` | `--fz--l` |
| ハーフレディング・行間 (lh/hl) | `base`, `xs`, `s`, `l` | `--hl--{key}` | `--hl--s` |
| 字間 (lts) | `base`, `s`, `l`, `xl` | `--lts--{key}` | `--lts--s` |
| フォント (ff) | `base`, `accent`, `mono` | `--ff--{key}` | `--ff--mono` |
| ウェイト (fw) | `light`, `normal`, `bold` | `--fw--{key}` | `--fw--bold` |
| 透明度 (o) | `mp`, `p`, `pp`, `ppp` | `--o--{key}` | `--o--p` |
| 角丸 (bdrs) | `10`, `20`, `30`, `40`, `99`, `inner` | `--bdrs--{key}` | `--bdrs--20` |
| 影 (bxsh) | `10`, `20`, `30`, `40`, `50` | `--bxsh--{N}` | `--bxsh--20` |
| サイズ (sz) | `xs`, `s`, `m`, `l`, `xl` | `--sz--{key}` | `--sz--l` |
| アスペクト比 (ar) | `og` | `--ar--{key}` | `--ar--og` |
| フロー余白 (flow) | `base`, `s` | `--flow--{key}` | `--flow--base` |
| セマンティックカラー (color) | `base`, `base-2`, `text`, `text-2`, `divider`, `link`, `brand`, `accent`, `neutral` | `--{name}` | `--brand` |
| パレットカラー (palette) | `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `gray`, `white`, `black` | `--{name}` | `--red` |


---


## 余白 (space)

フィボナッチ数列ベースのスケーリング。`--s-unit`（デフォルト `calc(var(--fz--base) * 0.5)` ＝ ≒ 8px）を基準単位とする。

| CSS変数 | 値 | 実サイズ目安 |
|---------|-----|------------|
| `--s5` | `calc(var(--s-unit) * 0.5)` | ≒ 4px |
| `--s10` | `var(--s-unit)` | ≒ 8px |
| `--s15` | `calc(var(--s-unit) * 1.5)` | ≒ 12px |
| `--s20` | `calc(var(--s-unit) * 2)` | ≒ 16px |
| `--s25` | `calc(var(--s-unit) * 2.5)` | ≒ 20px |
| `--s30` | `calc(var(--s-unit) * 3)` | ≒ 24px |
| `--s35` | `calc(var(--s-unit) * 4)` | ≒ 32px |
| `--s40` | `calc(var(--s-unit) * 5)` | ≒ 40px |
| `--s50` | `calc(var(--s-unit) * 8)` | ≒ 64px |
| `--s60` | `calc(var(--s-unit) * 13)` | ≒ 104px |
| `--s70` | `calc(var(--s-unit) * 21)` | ≒ 168px |
| `--s80` | `calc(var(--s-unit) * 34)` | ≒ 272px |

`--s40` 以降の主軸は係数 `1, 2, 3, 5, 8, 13, 21, 34`（フィボナッチ数列）に基づく。`--s5`〜`--s35` の前半部分は、主軸トークン間を補う中間値（4px / 12px / 20px / 32px 相当）として配置している。`--s-unit` を上書きするとスケール全体を比例的に調整できる。

### `set--s` ユーティリティ

`set--s` クラスを当てた要素のスコープ内では `--s-unit` が `0.5em` に切り替わり、`--s10`〜`--s80` が現在のフォントサイズ基準で再計算される。Button / Badge / インライン要素など、内部余白をフォントサイズに追従させたい部品で使う。

```html
<!-- ボタンの padding が button 自身の font-size に追従する -->
<button class="set--s -fz:s -py:10 -px:20">...</button>
```

`--s-unit` を任意値で上書きすれば、別の基準にも切り替えられる。

```html
<button class="set--s -p:10" style="--s-unit: .4375em">...</button>
```


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
| `--fz--base` | `1rem` | 本文の基本フォントサイズ |

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
| `--lts--s` | `-0.025em` | 狭めの文字間隔 |
| `--lts--l` | `0.05em` | 広めの文字間隔 |
| `--lts--xl` | `0.1em` | より広い文字間隔 |


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

音楽の強弱記号（piano 系列）に由来するセマンティック命名を採用。`p`（piano / 弱く）の反復回数が多いほど透明度が増す。Lism 内で「文字の反復回数で段階を表す」命名は opacity のみの例外。

| CSS変数 | 値 | 説明 |
|---------|-----|------|
| `--o--mp` | `0.9` | mezzo-piano: ごく軽い減衰 |
| `--o--p` | `0.75` | piano: hover fade, 補助テキスト等 |
| `--o--pp` | `0.5` | pianissimo: disabled, divider, decorator 等 |
| `--o--ppp` | `0.25` | pianississimo: 最も強く減衰 |


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

`--shc`（シャドウカラー）と `--shsz--{N}`（シャドウサイズ）を組み合わせて構成される。要素ごとに `--shc` を上書きして再計算したい場合は、`set--bxsh` クラスを併用する。

| CSS変数 | 値 |
|---------|-----|
| `--bxsh--10` | `var(--shsz--10) var(--shc)` |
| `--bxsh--20` | `var(--shsz--20) var(--shc)` |
| `--bxsh--30` | `var(--shsz--30) var(--shc)` |
| `--bxsh--40` | `var(--shsz--40) var(--shc)` |
| `--bxsh--50` | `var(--shsz--50) var(--shc)` |

| CSS変数 | 初期値 |
|---------|-----|
| `--shadow` | `hsl(220 4% 8% / 12%)` |
| `--shc` | `var(--shadow)` |
| `--shsz--10` | `0px 1px 3px` |
| `--shsz--20` | `0px 2px 6px` |
| `--shsz--30` | `0px 4px 12px` |
| `--shsz--40` | `0px 8px 24px` |
| `--shsz--50` | `0px 16px 48px` |


## フロー余白 (flow)

`l--flow` のコンテンツ間余白に使われるトークン。`:root` で定義されている。

| CSS変数 | 値 | 説明 |
|---------|-----|------|
| `--flow--base` | `var(--s30)`（`lang="ja"` 時は `var(--s35)`） | `l--flow` の基準余白 |
| `--flow--s` | `var(--s20)` | `-flow:s` で適用される小さめの余白 |


## ガター (gutter)

サイト全体のガター（左右余白）量を扱う変数群。`--flow--base` / `--flow` と同じく「基準値（`:root`）+ 要素ローカル機能変数」の2層構造を採る。

| CSS変数 | 初期値 | 説明 |
|---------|--------|------|
| `--gutter--base` | `var(--s30)` | サイトコンテンツの左右余白の基準値（`:root` で定義） |
| `--gutter` | `var(--gutter--base)` | `.has--gutter` で要素ローカルに初期化される機能変数。要素単位で `style="--gutter: 20px"` のように上書き可能 |

参照される主な箇所:

- `has--gutter` の `padding-inline: var(--gutter)`
- `is--container` の `--sz--bleed` 計算（`100cqi + var(--gutter) * 2`）
- `-max-sz:full` の負 margin による hang 拡張（`var(--gutter)` を参照）


## カラー

### セマンティックカラー

サイト全体のカラー設計に使用するトークン。

| CSS変数 | デフォルト値 | 説明 |
|---------|------------|------|
| `--base` | `hsl(220 0% 99%)` | ベース背景色 |
| `--base-2` | `hsl(220 4% 95%)` | 代替背景色 |
| `--text` | `hsl(220 0% 8%)` | 基本テキスト色 |
| `--text-2` | `hsl(220 4% 32%)` | 補助テキスト色 |
| `--divider` | `hsl(220 4% 88%)` | 区切り線色 |
| `--link` | `oklch(50% 0.3 240)` | リンク色 |
| `--brand` | `#1e5f8c` | ブランド色 |
| `--accent` | `#d94a6a` | アクセント色 |
| `--neutral` | `hsl(220, 2%, 80%)` | hover 背景などの生成に使う中立的な補助色 |

### パレットカラー

OKLCH で定義されたカラーパレット。`--L`（明度）と `--C`（彩度）の基準値を調整するとパレット全体の色味を変更可能。デフォルト: `--L: 60%`, `--C: 0.2`。

| CSS変数 | 値 |
|---------|-----|
| `--red` | `oklch(var(--L) var(--C) 20)` |
| `--orange` | `oklch(calc(var(--L) + 6%) calc(var(--C) - 0.01) 48)` |
| `--yellow` | `oklch(calc(var(--L) + 12%) calc(var(--C) - 0.02) 80)` |
| `--green` | `oklch(calc(var(--L) + 4%) calc(var(--C) - 0.02) 152)` |
| `--blue` | `oklch(calc(var(--L) - 4%) calc(var(--C) + 0.01) 264)` |
| `--purple` | `oklch(calc(var(--L) - 4%) calc(var(--C) + 0.01) 288)` |
| `--pink` | `oklch(calc(var(--L) + 2%) calc(var(--C) + 0.01) 352)` |
| `--gray` | `oklch(calc(var(--L) - 4%) calc(var(--C) / 10) 240)` |
| `--black` | `#000` |
| `--white` | `#fff` |

### キーカラー変数 (`--keycolor`)

`--keycolor` は、カラートークンとは性質が異なる。初めから値があるわけではない。ボックス全体のカラーリングなどを行う際の「軸となる色」を指定するための変数。

`--keycolor: var(--red)` のように指定しておくことで、そのボックス自身や子要素のカラー Props（`c`, `bgc`, `bdc` など）で 特定の色をハードコーディングせずに `--keycolor` 経由で参照できるようにすることができる。代表的な使用例は `u--cbox` ユーティリティクラス。

```html
<!-- ボックスにキーカラーを設定、テキストをキーカラーに連動させる例 -->
<div class="u--cbox" style="--keycolor: var(--red)">
  <p class="-c" style="-c:var(--keycolor)">...</p>
</div>
```
```jsx
<Lism class="u--cbox" keycolor="var(--red)">
  <Text c="keycolor">...</Text>
</Lism>
```

- `c`, `bgc` 等のカラー系 Props では、セマンティックカラー → パレットカラーの順で検索される
- どちらも最終的に `var(--{name})` に変換される


## トークン値の命名規則

1. **`s`, `m`, `l`, `xl` 等のサイズ表記** — ベース値（`base` or `m`）があり、それに対する大小を表すトークン
   - `:root`/`body` にセットされている値に戻すものは `base`、そうでない中心値は `m`
2. **`10`, `20`, `30` 等の数値表記** — `0`（`none`）が基準で、段階的に値を持つトークン
3. **セマンティック名** — プロパティ固有の意味を持つ名前（例: `--ar--og`, `--ff--mono`など）
