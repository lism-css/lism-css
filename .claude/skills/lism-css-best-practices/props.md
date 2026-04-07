# Props システム

Lism コンポーネントでは、CSSプロパティを短縮名の props として指定します。
値にはデザイントークン（[tokens.md](./tokens.md) 参照）を使ってください。

> ここに記載しているのは代表的な Props のみです。使用可能な全ての Props・クラスについては各セクション末尾のリンク先を参照してください。


## Prop Class（HTML での記法）

JSX の Props は、HTML では **Prop Class** `.-{prop}:{value}` として表現します。

```jsx
// JSX
<Box p='20' fz='l' c='brand' />

// 対応する HTML
<div class="l--box -p:20 -fz:l -c:brand">...</div>
```

トークンやプリセットに該当しない任意の値は、クラスとCSS変数の組み合わせで指定します。

```html
<!-- 任意値: .-{prop} クラス + --{prop} 変数 -->
<div class="-w" style="--w: 200px">...</div>
```


## 主要な Props

| Prop | CSS | JSX 例 | HTML Class & Style |
|------|-----|--------|-----------------|
| `p`, `px`, `py` | `padding` 系 | `p='20'` | `.-p:20` |
| `m`, `mx`, `my` | `margin` 系 | `m='20'`, `mx='auto'` | `.-m:20`, `.-mx:auto` |
| `g` | `gap` | `g='20'` | `.-g:20` |
| `fz` | `font-size` | `fz='l'` | `.-fz:l` |
| `fw` | `font-weight` | `fw='bold'` | `.-fw:bold` |
| `lh` | `line-height` | `lh='l'` | `.-lh:l` |
| `ta` | `text-align` | `ta='center'` | `.-ta:center` |
| `c` | `color` | `c='brand'` | `.-c:brand` |
| `bgc` | `background-color` | `bgc='base-2'` | `.-bgc:base-2` |
| `d` | `display` | `d='none'` | `.-d:none` |
| `w`, `h` | `width`, `height` | `w='100%'` | `.-w:100%` |
| `bd` | `border` | `bd` | `.-bd` |
| `bdc` | `border-color` | `bdc='brand'` | `.-bdc:brand` |
| `bdrs` | `border-radius` | `bdrs='20'` | `.-bdrs:20` |
| `bxsh` | `box-shadow` | `bxsh='20'` | `.-bxsh:20` |
| `ar` | `aspect-ratio` | `ar='16/9'` | `.-ar:16/9` |
| `ov` | `overflow` | `ov='hidden'` | `.-ov:hidden` |
| `pos` | `position` | `pos='sticky'` | `.-pos:sticky` |
| `ai`, `jc` | `align-items` 等 | `ai='center'` | `.-ai:center` |
| `fxw` | `flex-wrap` | `fxw='wrap'` | `.-fxw:wrap` |
| `fxd` | `flex-direction` | `fxd='column'` | `.-fxd:col` |
| `gtc`, `gtr` | `grid-template` 系 | `gtc='1fr 1fr'` | `.-gtc` + `--gtc: 1fr 1fr` |

一部の値は HTML Class で省略形になります（例: `column` → `col`, `relative` → `rel`, `absolute` → `abs`）。

全Props一覧: https://lism-css.com/docs/prop-class/


## is-- Props（状態モジュール）

要素の構造的な振る舞いを定義するクラスです。`@layer lism-modules` に属します。
HTML では対応する `is--` クラスを直接付与します。

| JSX Prop | HTML クラス | 用途 |
|----------|-----------|------|
| `isContainer` | `is--container` | コンテナクエリのコンテナ化 |
| `isWrapper` | `is--wrapper` | 子要素のコンテンツ幅を制限（プリセット: `s`, `l`） |
| `isLayer` | `is--layer` | `inset: 0` の絶対配置レイヤー |
| `isLinkBox` | `is--linkBox` | ボックス全体をリンク化 |
| `isVertical` | `is--vertical` | 縦書きモード |

```jsx
// JSX
<Box isContainer isWrapper='l'>...</Box>

// 対応する HTML
<div class="l--box is--container is--wrapper -contentSize:l">...</div>
```

詳細: https://lism-css.com/docs/state/


## set-- Props（ベース設定）

機能を有効にするためのCSS変数やベーススタイルをセットアップするクラスです。`@layer lism-base` に属します。
HTML では対応する `set--` クラスを直接付与します。

| JSX Prop | HTML クラス | 用途 |
|----------|-----------|------|
| `setPlain` | `set--plain` | ボタン・リンク等のデフォルトスタイルをリセット |
| `setShadow` | `set--shadow` | 影トークン変数を再定義（`bxsh` と併用） |
| `setHov` | `set--hov` | ホバー状態の判定変数をセット |
| `setTransition` | `set--transition` | トランジション用CSS変数をセット |
| `setGutter` | `set--gutter` | 左右パディング（`--gutter-size`）を適用 |
| `setBp` | `set--bp` | ブレークポイント判定変数をセット |

```jsx
// JSX
<Box setShadow bxsh='20'>...</Box>

// 対応する HTML
<div class="l--box set--shadow -bxsh:20">...</div>
```

詳細: https://lism-css.com/docs/set/


## レスポンシブ対応

Lism CSS はコンテナクエリをデフォルトで採用しています。
ブレークポイント: `sm: 480px`, `md: 800px`

### コンポーネントの Props で指定する場合（推奨）

配列形式またはオブジェクト形式で指定します。

```jsx
// 配列形式: [デフォルト, sm, md]
<Box p={[20, 30, 40]} fz={['s', 'm', 'l']} />

// オブジェクト形式
<Box p={{ base: '20', sm: '30', md: '40' }} />
```

### HTML / Prop Class で指定する場合

Prop Class とCSS変数を組み合わせます。

```html
<div class="-p:20 -p_sm -p_md" style="--p_sm: var(--s30); --p_md: var(--s40)">
  ...
</div>
```

詳細: https://lism-css.com/docs/responsive/
