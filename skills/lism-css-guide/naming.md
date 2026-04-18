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
| `-10`, `-20`, `-30`... | `0`(`none`)基準で段階的に減少 | `--o---10`, `--o---20` |
| セマンティック名 | 上記に当てはまらない場合 | `--ar--og` |

### Property Class 用の変数

| 形式 | 説明 | 例 |
|------|------|-----|
| `--{prop}` | クラスの `{prop}` 部分と同じ省略名 | `--p`, `--bgc`, `--bdrs`, `--max-sz` |
| `--{prop}_{bp}` | ブレークポイント値 | `--p_sm`, `--mx_md` |

### その他の変数

| 形式 | 用途 | 例 |
|------|------|-----|
| `--{target}-{prop}` | 要素・クラスに対するプロパティ（`:root`で上書き可） | `--link-td`, `--headings-ff` |
| `--{propName}` | プリミティブの主要機能変数 | `--sideW`, `--mainW` |
| `--_{item}-{propName}` | `c--` の子要素プロパティ | `--_icon-size` |
| `--_{varName}` | 状態管理用の内部変数 | `--_isHov`, `--_notHov` |


## クラスの命名規則

プレフィックスとクラス分類の対応:

- Component: `c--`
- Atomic Primitives: `a--`
- Layout Primitives: `l--`
- Trait Primitives: `is--`
- Set Class: `set--`
- Utility Class: `u--`

プレフィックスに続く名称は camelCase（例: `c--myComponent`）。

Property Class の形式:

- 特定の値とセット: `-{prop}:{value}`
- `--{prop}` 変数を受け取る: `-{prop}`
- ブレークポイント値を受け取る: `-{prop}_{bp}`


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
.-p10             → padding: var(--s10);
.-fw:bold         → font-weight: var(--fw--bold);
.-bdrs:20         → border-radius: var(--bdrs--20);
```

トークン値が `-{NUM}` のものも、値をそのまま連結した変数名になる。

```
.-o:-10          → opacity: var(--o---10);
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
