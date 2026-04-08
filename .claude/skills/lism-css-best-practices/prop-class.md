# Prop Class

Prop Class は、主要な CSS プロパティに対して頻繁に使用される値やトークンを手軽にセットできるユーティリティクラスです。  
CSS Layer の外（最も高い詳細度）に配置され、`-{prop}(:{value})` / `-{prop}_{bp}` の形式で定義されています。


## 基本書式

### プリセット値

トークンやプリセットに対応する値は、`-{prop}:{value}` の書式でクラスを指定します。

```html
<div class="-p:20 -fz:l -c:brand">...</div>
```

### カスタム値（任意の値）

トークンやプリセットに該当しない任意の値は、**`-{prop}` クラス** と **`--{prop}` CSS変数** の組み合わせで指定します。

```html
<!-- カスタム値: .-{prop} クラス + --{prop} 変数 -->
<div class="-w" style="--w: 200px">...</div>
<div class="-gtc" style="--gtc: 1fr 2fr 1fr">...</div>
```


## 表の読み方

| カラム | 説明 |
|--------|------|
| **Prop** | クラス名に使う省略名（例: `-fz:l` の `fz` 部分）。Lism コンポーネントの Props 名でもある |
| **CSS プロパティ** | 実際に制御される CSS プロパティ |
| **プリセット値クラス** | そのまま使えるクラス名の一覧（`-{prop}:{value}` 形式）。`—` はカスタム値のみ対応 |
| **BP クラス** | ブレークポイント対応クラス。`—` は非対応 |


## 全 Prop 一覧

### タイポグラフィ

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `f` | `font` | `-f:inherit` | — |
| `fz` | `font-size` | `-fz:root`, `-fz:base`, `-fz:5xl`〜`-fz:2xs` | `-fz_sm`, `-fz_md` |
| `fw` | `font-weight` | `-fw:light`, `-fw:normal`, `-fw:bold`, `-fw:100`〜`-fw:900` | — |
| `ff` | `font-family` | `-ff:base`, `-ff:accent`, `-ff:mono` | — |
| `fs` | `font-style` | `-fs:italic` | — |
| `lh` | `line-height`（`--hl` 経由） | `-lh:base`, `-lh:xs`, `-lh:s`, `-lh:l`, `-lh:1` | — |
| `hl` | `--hl` 変数のみ | — | `-hl_sm`, `-hl_md` |
| `lts` | `letter-spacing` | `-lts:base`, `-lts:s`, `-lts:l` | — |
| `ta` | `text-align` | `-ta:center`, `-ta:left`, `-ta:right` | — |
| `td` | `text-decoration` | `-td:none` | — |
| `tt` | `text-transform` | `-tt:upper`, `-tt:lower` | — |

**注意:** `lh` は `--hl`（half-leading）変数を介して `line-height: calc(1em + var(--hl) * 2)` を制御します。`hl` は `--hl` 変数を直接セットするだけの isVar タイプです。

### 表示・可視性

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `d` | `display` | `-d:none`, `-d:block`, `-d:flex`, `-d:inline-flex`, `-d:grid`, `-d:inline-grid` | `-d_sm`, `-d_md` |
| `o` | `opacity` | `-o:0`, `-o:-10`, `-o:-20`, `-o:-30` | — |
| `v` | `visibility` | `-v:hidden` | — |
| `ov` | `overflow` | `-ov:hidden`, `-ov:auto`, `-ov:clip` | — |
| `ov-x` | `overflow-x` | `-ov-x:clip`, `-ov-x:auto`, `-ov-x:scroll` | — |
| `ov-y` | `overflow-y` | `-ov-y:clip`, `-ov-y:auto`, `-ov-y:scroll` | — |
| `ar` | `aspect-ratio` | `-ar:21/9`, `-ar:16/9`, `-ar:3/2`, `-ar:1/1`, `-ar:og` | `-ar_sm`, `-ar_md` |

### サイズ

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `w` | `width` | `-w:100%`, `-w:fit` | `-w_sm`, `-w_md` |
| `h` | `height` | `-h:100%`, `-h:fit` | `-h_sm`, `-h_md` |
| `min-w` | `min-width` | `-min-w:100%` | `-min-w_sm`, `-min-w_md` |
| `max-w` | `max-width` | `-max-w:100%` | `-max-w_sm`, `-max-w_md` |
| `min-h` | `min-height` | `-min-h:100%` | `-min-h_sm`, `-min-h_md` |
| `max-h` | `max-height` | `-max-h:100%` | `-max-h_sm`, `-max-h_md` |
| `sz` | `inline-size` | — | — |
| `min-sz` | `min-inline-size` | — | — |
| `max-sz` | `max-inline-size` | `-max-sz:xs`, `-max-sz:s`, `-max-sz:m`, `-max-sz:l`, `-max-sz:xl`, `-max-sz:full`, `-max-sz:container` | — |
| `ysz` | `block-size` | — | — |
| `min-ysz` | `min-block-size` | — | — |
| `max-ysz` | `max-block-size` | — | — |

**`max-sz` の特殊クラス:**
- `-max-sz:full` — `max-inline-size: 100%`。`.set--gutter` 内では gutter 分を含めた全幅に拡張
- `-max-sz:container` — コンテナ幅に合わせる（`margin-inline` で中央配置）

### 背景

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `bg` | `background` | — | `-bg_sm`, `-bg_md` |
| `bgi` | `background-image` | — | — |
| `bgr` | `background-repeat` | `-bgr:no-repeat` | — |
| `bgp` | `background-position` | `-bgp:center` | — |
| `bgsz` | `background-size` | `-bgsz:cover`, `-bgsz:contain` | — |
| `bgc` | `background-color` | `-bgc:base`, `-bgc:base-2`, `-bgc:text`, `-bgc:brand`, `-bgc:accent`, `-bgc:inherit`, `-bgc:transparent` | — |

### カラー

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `c` | `color` | `-c:base`, `-c:text`, `-c:text-2`, `-c:brand`, `-c:accent`, `-c:inherit` | — |
| `keycolor` | `--keycolor` 変数のみ | — | — |

セマンティックカラー: `base`, `base-2`, `text`, `text-2`, `divider`, `link`, `brand`, `accent`  
パレットカラー: `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `gray`, `white`, `black`, `keycolor`

### 角丸

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `bdrs` | `border-radius` | `-bdrs:0`, `-bdrs:10`, `-bdrs:20`, `-bdrs:30`, `-bdrs:40`, `-bdrs:99`, `-bdrs:inner` | `-bdrs_sm`, `-bdrs_md` |
| `bdrs-tl` | `border-top-left-radius` | — | — |
| `bdrs-tr` | `border-top-right-radius` | — | — |
| `bdrs-br` | `border-bottom-right-radius` | — | — |
| `bdrs-bl` | `border-bottom-left-radius` | — | — |
| `bdrs-ss` | `border-start-start-radius` | — | — |
| `bdrs-se` | `border-start-end-radius` | — | — |
| `bdrs-es` | `border-end-start-radius` | — | — |
| `bdrs-ee` | `border-end-end-radius` | — | — |

### 影

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `bxsh` | `box-shadow` | `-bxsh:0`, `-bxsh:10`, `-bxsh:20`, `-bxsh:30`, `-bxsh:40` | `-bxsh_sm`, `-bxsh_md` |

**注意:** `bxsh` の使用時は `set--shadow` クラスの併用が必要です（影色 `--shc` の再計算のため）。

### ポジション

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `pos` | `position` | `-pos:static`, `-pos:fixed`, `-pos:sticky`, `-pos:relative`, `-pos:absolute` | — |
| `z` | `z-index` | `-z:-1`, `-z:0`, `-z:1`, `-z:99` | — |
| `t` | `top` | `-t:0`, `-t:50%`, `-t:100%` | — |
| `l` | `left` | `-l:0`, `-l:50%`, `-l:100%` | — |
| `r` | `right` | `-r:0`, `-r:50%`, `-r:100%` | — |
| `b` | `bottom` | `-b:0`, `-b:50%`, `-b:100%` | — |
| `i` | `inset` | `-i:0` | — |
| `i-x` | `inset-inline` | — | — |
| `i-y` | `inset-block` | — | — |
| `i-x-s` | `inset-inline-start` | — | — |
| `i-x-e` | `inset-inline-end` | — | — |
| `i-y-s` | `inset-block-start` | — | — |
| `i-y-e` | `inset-block-end` | — | — |

### スペーシング — Padding

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `p` | `padding` | `-p:0`, `-p:5`, `-p:10`, `-p:20`, ... (SPACE トークン) | `-p_sm`, `-p_md` |
| `px` | `padding-inline` | `-px:0`, `-px:5`, `-px:10`, `-px:20`, ... (SPACE トークン) | `-px_sm`, `-px_md` |
| `py` | `padding-block` | `-py:0`, `-py:5`, `-py:10`, `-py:20`, ... (SPACE トークン) | `-py_sm`, `-py_md` |
| `px-s` | `padding-inline-start` | — | `-px-s_sm`, `-px-s_md` |
| `px-e` | `padding-inline-end` | — | `-px-e_sm`, `-px-e_md` |
| `py-s` | `padding-block-start` | — | `-py-s_sm`, `-py-s_md` |
| `py-e` | `padding-block-end` | — | `-py-e_sm`, `-py-e_md` |
| `pl` | `padding-left` | — | `-pl_sm`, `-pl_md` |
| `pr` | `padding-right` | — | `-pr_sm`, `-pr_md` |
| `pt` | `padding-top` | — | `-pt_sm`, `-pt_md` |
| `pb` | `padding-bottom` | — | `-pb_sm`, `-pb_md` |

SPACE トークン（全値）: `5`, `10`, `15`, `20`, `30`, `40`, `50`, `60`, `70`, `80`

### スペーシング — Margin

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `m` | `margin` | `-m:auto`, `-m:0`, `-m:5`, `-m:10`, `-m:20`, ... (SPACE トークン) | `-m_sm`, `-m_md` |
| `mx` | `margin-inline` | `-mx:auto`, `-mx:0`, `-mx:5`, `-mx:10`, `-mx:20`, ... (SPACE トークン) | `-mx_sm`, `-mx_md` |
| `my` | `margin-block` | `-my:auto`, `-my:0`, `-my:5`, `-my:10`, `-my:20`, ... (SPACE トークン) | `-my_sm`, `-my_md` |
| `mx-s` | `margin-inline-start` | `-mx-s:auto` | `-mx-s_sm`, `-mx-s_md` |
| `mx-e` | `margin-inline-end` | `-mx-e:auto` | `-mx-e_sm`, `-mx-e_md` |
| `my-s` | `margin-block-start` | `-my-s:auto`, `-my-s:0`, `-my-s:5`, `-my-s:10`, `-my-s:20`, ... (SPACE トークン) | `-my-s_sm`, `-my-s_md` |
| `my-e` | `margin-block-end` | `-my-e:auto` | `-my-e_sm`, `-my-e_md` |
| `ml` | `margin-left` | — | `-ml_sm`, `-ml_md` |
| `mr` | `margin-right` | — | `-mr_sm`, `-mr_md` |
| `mt` | `margin-top` | — | `-mt_sm`, `-mt_md` |
| `mb` | `margin-bottom` | — | `-mb_sm`, `-mb_md` |

### Gap

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `g` | `gap` | `-g:0`, `-g:inherit`, `-g:5`, `-g:10`, `-g:20`, ... (SPACE トークン) | `-g_sm`, `-g_md` |
| `cg` | `column-gap` | — | `-cg_sm`, `-cg_md` |
| `rg` | `row-gap` | — | `-rg_sm`, `-rg_md` |

### Flex

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `fxf` | `flex-flow` | — | — |
| `fxw` | `flex-wrap` | `-fxw:wrap` | `-fxw_sm`, `-fxw_md` |
| `fxd` | `flex-direction` | `-fxd:column`, `-fxd:column-reverse`, `-fxd:row-reverse` | `-fxd_sm`, `-fxd_md` |
| `fx` | `flex` | `-fx:1` | `-fx_sm`, `-fx_md` |
| `fxg` | `flex-grow` | `-fxg:1` | — |
| `fxsh` | `flex-shrink` | `-fxsh:0` | — |
| `fxb` | `flex-basis` | — | `-fxb_sm`, `-fxb_md` |

### Grid

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `gt` | `grid-template` | `-gt:repeat` | `-gt_sm`, `-gt_md` |
| `gta` | `grid-template-areas` | — | `-gta_sm`, `-gta_md` |
| `gtc` | `grid-template-columns` | `-gtc:subgrid` | `-gtc_sm`, `-gtc_md` |
| `gtr` | `grid-template-rows` | `-gtr:subgrid` | `-gtr_sm`, `-gtr_md` |
| `gaf` | `grid-auto-flow` | `-gaf:row`, `-gaf:column` | `-gaf_sm`, `-gaf_md` |
| `gac` | `grid-auto-columns` | — | — |
| `gar` | `grid-auto-rows` | — | — |
| `cols` | `--cols` 変数 | — | `-cols_sm`, `-cols_md` |
| `rows` | `--rows` 変数 | — | `-rows_sm`, `-rows_md` |

### Grid アイテム

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `ga` | `grid-area` | `-ga:1/1` | `-ga_sm`, `-ga_md` |
| `gc` | `grid-column` | `-gc:1/-1` | `-gc_sm`, `-gc_md` |
| `gr` | `grid-row` | `-gr:1/-1` | `-gr_sm`, `-gr_md` |
| `gcs` | `grid-column-start` | — | — |
| `gce` | `grid-column-end` | — | — |
| `grs` | `grid-row-start` | — | — |
| `gre` | `grid-row-end` | — | — |

### 配置（Places）

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `ai` | `align-items` | `-ai:start`, `-ai:center`, `-ai:end`, `-ai:stretch`, `-ai:flex-start`, `-ai:flex-end` | `-ai_sm`, `-ai_md` |
| `ac` | `align-content` | `-ac:start`, `-ac:center`, `-ac:end`, `-ac:flex-start`, `-ac:flex-end`, `-ac:between` | `-ac_sm`, `-ac_md` |
| `ji` | `justify-items` | `-ji:start`, `-ji:center`, `-ji:end`, `-ji:stretch`, `-ji:flex-start`, `-ji:flex-end` | `-ji_sm`, `-ji_md` |
| `jc` | `justify-content` | `-jc:start`, `-jc:center`, `-jc:end`, `-jc:flex-start`, `-jc:flex-end`, `-jc:between` | `-jc_sm`, `-jc_md` |
| `pi` | `place-items` | `-pi:start`, `-pi:center`, `-pi:end` | — |
| `pc` | `place-content` | `-pc:start`, `-pc:center`, `-pc:end` | — |
| `aslf` | `align-self` | `-aslf:start`, `-aslf:center`, `-aslf:end`, `-aslf:stretch` | — |
| `jslf` | `justify-self` | `-jslf:start`, `-jslf:center`, `-jslf:end`, `-jslf:stretch` | — |
| `pslf` | `place-self` | `-pslf:start`, `-pslf:center`, `-pslf:end` | — |
| `order` | `order` | `-order:0`, `-order:-1`, `-order:1` | — |

**コンポーネント用ショートハンド:** `ai`, `ac`, `ji`, `jc`, `aslf`, `jslf` では `s`→`start`, `e`→`end`, `c`→`center`, `fs`→`flex-start`, `fe`→`flex-end` のショートハンドが使えます。

## 特殊な Prop Class

以下は通常の `.-{prop}:{value}` パターンとは異なる特殊な仕組みを持つ Prop です。

### ボーダー（`bd` 系）

Lism CSS のボーダーは CSS 変数（`--bds`, `--bdw`, `--bdc`）で管理される特殊な仕様です。  
`-bd` または `-bd-{side}` クラスを付けると、初期値（`--bds: solid`, `--bdw: 1px`, `--bdc: var(--divider)`）がセットされ、`bds`, `bdc`, `bdw` Prop で個別に上書きできます。

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `bd` | `border`（変数管理を有効化） | `-bd:none` | — |
| `bds` | `--bds` 変数 | `-bds:dashed`, `-bds:dotted`, `-bds:double` | — |
| `bdc` | `--bdc` 変数 | `-bdc:brand`, `-bdc:accent`, `-bdc:divider`, `-bdc:inherit`, `-bdc:transparent`, `-bdc:current` | — |
| `bdw` | `--bdw` 変数 | — | `-bdw_sm`, `-bdw_md` |

**方向指定:**

| Prop | CSS プロパティ |
|------|--------------|
| `bd-x` | `border-inline` |
| `bd-y` | `border-block` |
| `bd-x-s` | `border-inline-start` |
| `bd-x-e` | `border-inline-end` |
| `bd-y-s` | `border-block-start` |
| `bd-y-e` | `border-block-end` |
| `bd-t` | `border-top` |
| `bd-b` | `border-bottom` |
| `bd-l` | `border-left` |
| `bd-r` | `border-right` |

```jsx
// JSX: ボーダー + カスタマイズ
<Box bd bdc="brand" bdw="2px" bds="dashed">...</Box>

// HTML
<div class="l--box -bd -bdc:brand" style="--bdw: 2px; --bds: dashed">...</div>

// 方向指定
<Box bd-y bdc="divider">...</Box>
// → <div class="l--box -bd-y -bdc:divider">...</div>
```

詳細: https://lism-css.com/docs/props/bd/

### ホバー（`hov` 系）

ホバーエフェクト用のクラスです。`-hov:{prop}` 系と `-hov:to:*` 系の2種類があります。

**`-hov:{prop}` — ホバー時のプロパティ変更**

`:hover` 擬似クラスで直接動作します（`set--hov` は不要）。`@media (any-hover: hover)` 内で定義され、タッチデバイスでは無効になります。

| クラス | 効果 | デフォルト値 |
|--------|------|-------------|
| `-hov:c` | テキスト色を変更 | `var(--hov-c, var(--link))` |
| `-hov:bgc` | 背景色を変更 | `var(--hov-bgc, var(--base-2))` |
| `-hov:bdc` | ボーダー色を変更 | `var(--hov-bdc, currentColor)` |
| `-hov:o` | 不透明度を変更 | `var(--hov-o, 0.7)` |
| `-hov:bxsh` | シャドウを変更 | `var(--hov-bxsh, var(--bxsh--40))` |
| `-hov:neutral` | ニュートラルグレーを混合 | `color-mix(...)` |

```jsx
// JSX: ホバーで色変更（set--hov なしで動作する）
<Link hov={{ c: true }}>リンク</Link>
// → <a class="-hov:c" href="...">リンク</a>

// カスタム値を指定
<Box hov={{ bgc: true }} style={{ '--hov-bgc': 'var(--brand)' }}>...</Box>
```

**`-hov:to:*` — `set--hov` 連動のトランジションクラス**

`set--hov` がセットする `--_isHov` / `--_notHov` 変数を利用して動作します。`set--hov` と `set--transition` の併用が必要です。

| クラス | 効果 | 仕組み |
|--------|------|--------|
| `-hov:to:hide` | ホバー時にフェードアウト | `opacity: var(--_isHov, 0)` |
| `-hov:to:show` | ホバー時にフェードイン | `opacity: var(--_notHov, 0)` |
| `-hov:to:zoom` | ホバー時にズーム | `scale: var(--_isHov, 1.1)` |

```jsx
// set--hov + set--transition が必要
<Box setHov setTransition>
  <Box hov={{ to: 'show' }}>ホバーで表示</Box>
</Box>
```

詳細: https://lism-css.com/docs/props/hov/

### その他

| Prop | CSS プロパティ | プリセット値クラス | BP クラス |
|------|--------------|-------------|-----|
| `ovwrap` | `overflow-wrap` | `-ovwrap:anywhere` | — |
| `whspace` | `white-space` | `-whspace:nowrap` | — |
| `float` | `float` | `-float:left`, `-float:right` | — |
| `clear` | `clear` | `-clear:both` | — |
| `isolation` | `isolation` | `-isolation:isolate` | — |


## 値の省略形（例外一覧）

Prop Class の値名は基本的に CSS の実値と同じですが、以下は省略形が使われます。

| クラス例 | 実際の CSS 値 | 対象 Prop |
|----------|------------|-----------|
| `-tt:upper` | `text-transform: uppercase` | `tt` |
| `-tt:lower` | `text-transform: lowercase` | `tt` |
| `-w:fit` | `width: fit-content` | `w`, `h` |
| `-ac:between` | `align-content: space-between` | `ac`, `jc` |
| `-bdc:current` | `border-color: currentColor` | `bdc` |
| `-t:0` | `top: 0%` | `t`, `l`, `r`, `b`, `i` |
| `-ga:1/1` | `grid-area: 1 / 1` | `ga`, `gc`, `gr` |
| `-gt:repeat` | 特殊な grid-template 値 | `gt` |

## Prop の出力タイプ

### `alwaysVar` タイプ

`fz`, `p`, `px`, `py`, `m`, `mx`, `my`, `g`, `c`, `bgc`, `bdrs`, `bxsh` など。  
プリセット値クラス（`-p:20`）でも常に CSS 変数（`--p`）経由で値が適用されます。これにより、子要素や疑似要素から `var(--p)` で親の値を参照できます。

### `isVar` タイプ

`hl`, `bds`, `bdc`, `bdw`, `keycolor`, `cols`, `rows`。  
CSS プロパティを直接操作せず、CSS 変数（`--{prop}`）のみをセットします。他のクラスやモジュールがその変数を参照する仕組みです。

### `overwriteBaseVar` タイプ

`p`, `m`, `g`, `bdrs` など。  
ブレークポイントクラス（`-p_sm`）適用時に、ベース変数（`--p`）も上書きされます。これにより、常に `var(--p)` で最新の値が取得できます。


## レスポンシブ対応

Lism CSS はコンテナクエリをデフォルトで採用しています。  
ブレークポイント: `sm: 480px`, `md: 800px`（`lg: 1120px` はカスタマイズにより利用可能）

### HTML / Prop Class での指定

ブレークポイント用のクラス `-{prop}_{bp}` と CSS変数 `--{prop}_{bp}` を組み合わせます。

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
1. `-p_sm` クラスは `@container (min-width: 480px)` 内で `padding: var(--p_sm)` を適用
2. `--p_sm` 変数で切り替え先の値を指定
3. `overwriteBaseVar` 対応の Prop はベース変数（`--p`）も上書きされる

### Lism コンポーネントでの指定

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

詳細: https://lism-css.com/docs/responsive/


## Lism コンポーネントでの使い方

Lism コンポーネントでは、CSS プロパティの短縮名を Props として指定します。  
内部で対応する Prop Class と CSS 変数に自動変換されます。

```jsx
// JSX の Props
<Box p='20' fz='l' c='brand' />

// 出力される HTML
<div class="l--box -p:20 -fz:l -c:brand">...</div>
```

カスタム値の場合:

```jsx
// JSX
<Box w="200px" gtc="1fr 2fr" />

// 出力される HTML
<div class="l--box -w -gtc" style="--w: 200px; --gtc: 1fr 2fr">...</div>
```

### `getLismProps()` による手動変換

外部コンポーネントに Lism のスタイルシステムを適用する場合は、`getLismProps()` で className と style を取得できます。

```jsx
import getLismProps from 'lism-css/lib/getLismProps';

const lismProps = getLismProps({ p: '20', fz: 'l', c: 'brand' });
// → { className: '-p:20 -fz:l -c:brand', style: {} }
```

詳細: https://lism-css.com/docs/prop-class/
