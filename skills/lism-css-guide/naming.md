# 命名規則

## TOC

- [CSS変数の命名規則](#css変数の命名規則)
- [クラスの命名規則](#クラスの命名規則)
- [`{prop}` の省略ルール](#prop-の省略ルール)
- [`{value}` の省略ルール](#value-の省略ルール)

[詳細](https://lism-css.com/docs/naming.md)

---

## CSS変数の命名規則

各ブロックは camelCase で `{varName}` の形式が基本。

### トークン変数

| 種類 | 形式 | 例 |
| --- | --- | --- |
| 基本 | `--{prop}--{token}` | `--fz--l`, `--bdrs--20`, `--bxsh--10`, `--sz--s` |
| カラー | `--{color}` | `--brand`, `--text`, `--text-2`, `--red` |
| 余白 | `--s{Token}` | `--s10`, `--s40` |

トークンのバリエーション:

| 表記 | 条件 | 例 |
| --- | --- | --- |
| `s`, `m`, `l`, `xl`... | ベース値を中心に大小の段階を示す | `--fz--s`, `--fz--l` |
| `base` | `:root`/`body` の初期値にセットされるもの | `--fz--base`, `--hl--base` |
| `10`, `20`, `30`... | `0`(`none`)基準で段階的に増加 | `--bdrs--20`, `--bxsh--30` |
| セマンティック名 | 上記に当てはまらない場合 | `--ar--og` |

例外: opacity トークン（`--o--mp` / `--o--p` / `--o--pp` / `--o--ppp`）は文字の反復回数で段階を表す（由来は [tokens.md](./tokens.md#透明度-o)）。

### Property Class 用の変数

| 形式 | 説明 | 例 |
| --- | --- | --- |
| `--{prop}` | クラスの `{prop}` 部分と同じ省略名 | `--p`, `--bgc`, `--bdrs`, `--m` |
| `--{prop}_{bp}` | ブレークポイント値 | `--p_sm`, `--mx_md` |

### その他の変数

| 形式 | 用途 | 例 |
| --- | --- | --- |
| `--{target}-{prop}` | 特定のセレクタを起点に、子要素へ設定するプロパティ | `--link-td`, `--headings-ff`, `--icon-size` |
| `--{propName}` | クラス自身の主要機能を制御する変数。要素側で値が初期化され、`:root` からは初期値の定義ができないもの | `--sideW`, `--mainW` |
| `--_{varName}` | 状態判定・内部計算の補助変数 | `--_isHov`, `--_flipX` |

`--{target}-{prop}`は、`:root`を起点にする場合も、`.b--*`や`.c--*`を起点にする場合も同じ形式です。`:root`以外を起点にする変数は、祖先や他のコンポーネントから同名の値を継承しないように、起点のセレクタで必ず初期値をセットします（例: `.b--list { --icon-size: 1em; }`）。値を変えるときも`:root`ではなく、起点の要素にインラインstyleやpropsで指定します。

## クラスの命名規則

クラス分類ごとのプレフィックス（`b--`/`c--`/`a--`/`l--`/`is--`/`has--`/`set--`/`u--`）と各分類の責務・所属レイヤーは、[css-rules.md](./css-rules.md#クラス分類とプレフィックス)の分類表を正本とします。ユーザー定義クラスの2分類（`b--`/`c--`）の使い分けは[css-rules.md](./css-rules.md#独自クラスの選び方2分類)を参照してください。

プレフィックスに続く名称は camelCase（例: `c--myComponent`）。`is--`/`has--`/`set--`/`u--`にも同じ規則が適用されます。ページ固有の要素は、ページslug等を含めると名前だけで由来がわかります（例: `c--landingHero`）。

### `c--*`/`b--*`の命名

Block/Element/Modifierの形式（Block=`c--{name}` / `b--{name}`、Element=`_`ひとつ、Modifier=`--`ふたつ）は[css-rules.md の独自クラスの選び方](./css-rules.md#独自クラスの選び方2分類)を参照。Block名はcamelCaseを第一候補にし、既存コードがアンダースコア区切りならそれに合わせます。単語区切りのハイフン（`c--feature-card`）とBEM風の`__`は使いません（NG→OK例は[antipatterns-layout.md](./antipatterns-layout.md#クラス名の命名ミス)を参照）。

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
| --- | --- | --- | --- |
| `p` | `padding` | `i` | `inset` |
| `m` | `margin` | `t` | `top` |
| `g` | `gap` | `b` | `bottom` |
| `c` | `color` | `l` | `left` |
| `f` | `font` | `r` | `right` |
| `w` | `width` | `o` | `opacity` |
| `h` | `height` | `v` | `visibility` |
| `d` | `display` | `z` | `z-index` |

Emmet と異なるのは `o` (`opacity`) のみ。

### プロパティグループ

#### 基本形式: 「グループ略称」+「サブプロパティ名の省略形」

| CSS プロパティ | Prop |
| --- | --- |
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

`inline-start`/`inline-end`は`is`/`ie`ではなく、すでに普及しているCSSフレームワークの慣習に沿って`s`/`e`とする。

| 方向 | サフィックス | 例 |
| --- | --- | --- |
| physical | `-t` / `-b` / `-l` / `-r` | `bd-t`, `bd-b`, `bd-l`, `bd-r` |
| inline / block | `-x` / `-y` | `bd-x`, `bd-y` |
| inline-start / end | `-s` / `-e` | `bd-s`, `bd-e`, `ps`, `pe`, `ms`, `me`, `i-s`, `i-e` |
| block-start / end | `-bs` / `-be` | `bd-bs`, `bd-be`, `pbs`, `pbe`, `mbs`, `mbe`, `i-bs`, `i-be` |
| x / y | `-x` / `-y` | `ov-x`, `ov-y` |

例外: `p`, `m` のみハイフンを省略 → `pt`, `px`, `my`, `ms` 等。

#### グループ略称の衝突禁止

一つのグループで使用された略称は他のグループで再利用しない。
NG例: `flex` → `fx` としたうえで `flex-shrink` を `fsh` にする（`fx` グループの一貫性を崩すため）。

### max- / min- プロパティ

`max-`, `min-` プレフィックスはハイフンを保持: `max-w`, `min-w`, `max-h`, `min-h`。

### その他のプロパティ

1. 1単語: そのまま使用 or 省略
2. ハイフン繋がり、または6文字以上: Emmet形式または認識しやすい範囲で省略

| CSS プロパティ | Prop | 分類 |
| --- | --- | --- |
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
| --- | --- | --- |
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

opacity トークンもそのままクラス化される（`.-o:p` → `opacity: var(--o--p)`）。

### 長いキーワード値の省略

6文字以上かつ省略しても意味が通るものは省略可（`uppercase` → `-tt:upper` 等）。一覧は [property-class.md](./property-class.md#値の省略形例外一覧) を参照。
