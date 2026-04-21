# 命名規則

## TOC

- [CSS変数の命名規則](#css変数の命名規則)
- [クラスの命名規則](#クラスの命名規則)
- [`{prop}` の省略ルール](#prop-の省略ルール)
- [`{value}` の省略ルール](#value-の省略ルール)

[詳細](https://lism-css.com/docs/naming/)

---

## CSS変数の命名規則

各ブロックは camelCase で `{varName}` の形式が基本。

### トークン変数

| 種類 | 形式 | 例 |
|------|------|-----|
| 基本 | `--{prop}--{token}` | `--fz--l`, `--bdrs--20`, `--bxsh--10`, `--sz--s` |
| カラー | `--{color}` | `--brand`, `--text`, `--text-2`, `--red` |
| スペーシング | `--s{Token}` | `--s10`, `--s40` |

トークンのバリエーション:

| 表記 | 条件 | 例 |
|------|------|-----|
| `s`, `m`, `l`, `xl`... | ベース値を中心に大小の段階を示す | `--fz--s`, `--fz--l` |
| `base` | `:root`/`body` の初期値にセットされるもの | `--fz--base`, `--lh--base` |
| `10`, `20`, `30`... | `0`(`none`)基準で段階的に増加 | `--bdrs--20`, `--bxsh--30` |
| セマンティック名 | 上記に当てはまらない場合 | `--ar--og` |

> 🎵 **例外: opacity トークン**
> opacity（`--o--mp` / `--o--p` / `--o--pp` / `--o--ppp`）は、音楽の強弱記号（piano 系列）に由来するセマンティック命名を採用している。`p`（piano / 弱く）の反復回数が多いほど透明度が増す構造で、「文字の反復回数で段階を表す」命名は Lism 内で opacity のみの例外。

### Property Class 用の変数

| 形式 | 説明 | 例 |
|------|------|-----|
| `--{prop}` | クラスの `{prop}` 部分と同じ省略名 | `--p`, `--bgc`, `--bdrs`, `--max-sz` |
| `--{prop}_{bp}` | ブレークポイント値 | `--p_sm`, `--mx_md` |

### その他の変数

| 形式 | 用途 | 例 |
|------|------|-----|
| `--{target}-{prop}` | 要素・クラスに対するプロパティ（`:root`で上書き可） | `--link-td`, `--headings-ff` |
| `--{propName}` | クラス自身の主要機能を制御する変数。要素側で値が初期化され、`:root` からは初期値の定義ができないもの | `--sideW`, `--mainW` |
| `--_{item}-{propName}` | `c--` の子要素プロパティ | `--_icon-size` |
| `--_{varName}` | 状態管理用の内部変数 | `--_isHov`, `--_notHov` |


## クラスの命名規則

プレフィックスとクラス分類の対応:

- Component: `c--`
- Atomic Primitives: `a--`
- Layout Primitives: `l--`
- Trait（役割宣言）: `is--`
- Trait（機能付与）: `has--`
- Set Class: `set--`
- Utility Class: `u--`

プレフィックスに続く名称は camelCase（例: `c--myComponent`）。

**使い分けの判断軸:**

| プレフィックス | 責務 | 代表例 |
|---|---|---|
| `set--` | HTML 要素の基礎スタイリング / 変数セット | `set--plain`, `set--revert`, `set--var:hov`, `set--var:bxsh` |
| `is--` | 〜である（役割・存在の宣言）。CSS 変数は必須ではない | `is--container`, `is--wrapper`, `is--layer` |
| `has--` | 〜を持つ（単一機能 trait の付与）。CSS 変数でカスタマイズ可 | `has--transition`, `has--gutter`, `has--snap`, `has--mask` |
| `u--` | 装飾的効果（単独 or 子要素の装飾） | `u--trim`, `u--cbox`, `u--divide`, `u--cells` |

- `set--` は `@lism-base` 層で HTML 要素の基礎スタイル・変数を提供するもの。
- `is--` / `has--` は `@lism-trait` 層に属する。

Property Class の形式:

- 特定の値とセット: `-{prop}:{value}`
- `--{prop}` 変数を受け取る: `-{prop}`
- ブレークポイント値を受け取る: `-{prop}_{bp}`
- 修飾子 + Property Class 合成: `-{modifier}:-{prop}`（例: `-hov:-c` は `-c` の hover バリアント）


## `{prop}` の省略ルール

基本は [Emmet](https://docs.emmet.io/cheat-sheet/) 準拠。

> **Note**: 「1文字プロパティ」セクション以外の表は **代表例** であり、全プロパティの一覧ではない。記載のないプロパティは本ページのルールに沿って省略する。

### 1文字プロパティ

1文字に省略する主要プロパティは以下の通り（このリストが全て）。

| 省略 | プロパティ | 省略 | プロパティ |
|------|-----------|------|-----------|
| `p` | `padding`    | `i` | `inset` |
| `m` | `margin`     | `t` | `top` |
| `g` | `gap`        | `b` | `bottom` |
| `c` | `color`      | `l` | `left` |
| `f` | `font`       | `r` | `right` |
| `w` | `width`      | `o` | `opacity` |
| `h` | `height`     | `v` | `visibility` |
| `d` | `display`    | `z` | `z-index` |

Emmet と異なるのは `o` (`opacity`) のみ。

### プロパティグループ

#### 基本形式: 「グループ略称」+「サブプロパティ名の省略形」

| CSS プロパティ | Prop |
|-------------|------|
| font-size | `fz` |
| font-weight | `fw` |
| background-color | `bgc` |
| background-image | `bgi` |
| flex | `fx` |
| flex-shrink | `fxsh` |
| flex-grow | `fxg` |
| grid-template-columns | `gtc` |
| grid-template-rows | `gtr` |

#### 方向指定系: 「グループ略称」 + `-` +「方向指定」

| 方向 | サフィックス | 例 |
|------|-----------|-----|
| physical | `-t` / `-b` / `-l` / `-r` | `bd-t`, `bd-b`, `bd-l`, `bd-r` |
| inline / block | `-x` / `-y` | `bd-x`, `bd-y` |
| start / end | `-s` / `-e` | `bd-x-s`, `bd-x-e`, `bd-y-s`, `bd-y-e` |
| x / y | `-x` / `-y` | `ov-x`, `ov-y` |

例外: `p`, `m` のみ最初のハイフンを省略 → `pt`, `px`, `my`, `mx-s` 等。

#### グループ略称の衝突禁止

一つのグループで使用された略称は他のグループで再利用しない。
NG例: `flex` → `fx` としたうえで `flex-shrink` を `fsh` にする（`fx` グループの一貫性を崩すため）。

### max- / min- プロパティ

`max-`, `min-` プレフィックスはハイフンを保持: `max-w`, `min-w`, `max-h`, `min-h`。

### その他のプロパティ

1. 1単語: そのまま使用 or 省略
2. ハイフン繋がり、または6文字以上: Emmet形式または認識しやすい範囲で省略

| CSS プロパティ | Prop | 分類 |
|-------------|------|------|
| float | `float` | そのまま |
| order | `order` | そのまま |
| position | `pos` | 省略 |
| overflow | `ov` | 省略 |
| inline-size | `sz` | 省略 |
| block-size | `bsz` | 省略 |
| aspect-ratio | `ar` | 省略 |
| writing-mode | `wm` | 省略 |
| white-space | `whs` | 省略 |

### 1文字プロパティの短縮名の再利用

グループを持たない1文字プロパティや、方向プロパティのみをサブプロパティに持つ場合は、衝突しない範囲で再利用可。

| 1文字 Prop | 再利用先 | 展開例 |
|-----------|---------|--------|
| `t`(`top`) | `text-*` | `ta`(`text-align`) |
| `l`(`left`) | `line-*` | `lh`(`line-height`) |
| `w`(`width`) | `writing-*` | `wm`(`writing-mode`) |
| `p`(`padding`) | `place-*` | `pi`(`place-items`) |


## `{value}` の省略ルール

### 基本: CSS の実値をそのまま使う

`{prop}` は既に省略されているため、`{value}` はそのまま残して組み合わせから推測可能にする。

```
.-d:none          → display: none;
.-d:inline-flex   → display: inline-flex;
.-pos:relative    → position: relative;
.-ta:center       → text-align: center;
.-fx:1            → flex: 1;
.-fxd:column      → flex-direction: column;
```

### トークン値を利用する場合

対応するトークンがある場合は、トークン値（`--{token}--{value}` の `{value}` 部分）を使う:

```
.-c:text-2        → color: var(--text-2);
.-fz:l            → font-size: var(--fz--l);
.-p:10            → padding: var(--s10);
.-fw:bold         → font-weight: var(--fw--bold);
.-bdrs:20         → border-radius: var(--bdrs--20);
```

opacity トークンは音楽記号に由来する例外的な命名で、そのままクラス化される。

```
.-o:mp            → opacity: var(--o--mp);
.-o:p             → opacity: var(--o--p);
.-o:pp            → opacity: var(--o--pp);
.-o:ppp           → opacity: var(--o--ppp);
```

### 長いキーワード値の省略

6文字以上かつ省略しても意味が通るものは省略可:

| 実際の値 | 省略名 | クラスの例 |
|--------|------------|-----|
| `uppercase` | `upper` | `-tt:upper` |
| `lowercase` | `lower` | `-tt:lower` |
| `fit-content` | `fit` | `-w:fit`, `-h:fit` |
| `space-between` | `between` | `-ac:between`, `-jc:between` |
| `currentColor` | `current` | `-bdc:current` |
