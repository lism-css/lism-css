# CSS 設計ルール

## TOC

- [CSS Layer 構造](#css-layer-構造)
- [命名規則とプレフィックス](#命名規則とプレフィックス)
- [カスタムCSS を追加する場合](#カスタムcss-を追加する場合)
- [CSS の配置場所](#css-の配置場所)

[詳細](https://lism-css.com/docs/css-methodology/)

---

## CSS Layer 構造

Lism CSS は CSS Layers による詳細度管理を採用しています。
カスタムCSSを追加する場合は、この順序を意識してください。

```
Settings（トークン定義）
  → @layer lism-base（Reset CSS・トークン・.set--クラス）
      → @layer reset（リセットCSS）
  → @layer lism-primitives
      → @layer trait（.is-- Trait Primitive）
      → @layer layout（.l-- Layout Primitive）
      → @layer atomic（.a-- Atomic Primitive）
  → @layer lism-components（.c-- Component Class — BEM 構造を持つ UI 部品）
  → @layer lism-custom（ユーザーカスタマイズ用）
  → @layer lism-utility（.u-- ユーティリティクラス）
  → Property Class（レイヤー外 — 最も詳細度が高い）
```


## 命名規則とプレフィックス

[詳細](https://lism-css.com/docs/primitives/)

クラス名のプレフィックスによって、役割とレイヤーの所属が決まります。

| プレフィックス | レイヤー | 役割 | 例 |
|--------------|---------|------|-----|
| `.set--` | lism-base | ベーススタイル上書き・トークン再定義 | `.set--plain`, `.set--transition` |
| `.is--` | lism-primitives.trait | Trait Primitive（要素の静的特性） | `.is--container`, `.is--wrapper` |
| `.l--` | lism-primitives.layout | Layout Primitive | `.l--grid`, `.l--flex`, `.l--stack` |
| `.a--` | lism-primitives.atomic | Atomic Primitive | `.a--icon`, `.a--divider` |
| `.c--` | lism-components | Component Class（BEM 構造を持つ UI 部品） | `.c--button`, `.c--accordion` |
| `.u--` | lism-utility | 用途が明確なユーティリティ | `.u--cbox`, `.u--trim` |
| `.-` | レイヤー外 | 単一プロパティ制御（Property Class） | `.-fz:l`, `.-p:20`, `.-d:none` |

**併用ルール:**
- `.l--` と `.c--` は併用OK（例: `<div class="l--flex c--nav">`）
- 同カテゴリ内の Primitive 併用は不可（例: `.l--flex` と `.l--grid`、`.a--icon` と `.a--divider` は同要素に付けない）
- `.l--` × `.a--` は非推奨（役割的に同居しない想定）
- `.is--` 同士は併用OK（Trait は複数併用できる）
- `.is--` × `.l--` / `.a--` も併用OK
- `c--` の Block 同士の併用（`.c--xxx.c--yyy`）は基本 NG。ただし以下は許容:
  - Block と自身の Modifier: `.c--button.c--button--outline`
  - Block と他 Block の Element: `.c--xxx.c--yyy_elem`
- 子要素: `.c--card_header`, `.c--card_body`（`c--` のみ Element を持つ。`_` 一つ区切り）

**記述順序:**
class 属性にクラスを直接記述する場合は、以下の順序で並べてください。粒度の大きい（塊としての役割を持つ）クラスから、粒度の小さい（単一プロパティ制御）クラスの順です。

```
[customClass] [c--/a--] [l--] [is--*] [set--*] [u--*] [Property Class...]
```

| # | 区分 | 例 |
|---|---|---|
| 1 | 独自クラス（`customClass`） | `my-card`, `hoge` |
| 2 | Component / Atomic Primitive（`c--` / `a--`） | `c--box`, `a--icon`, `c--box c--box--primary` |
| 3 | Layout Primitive（`l--`） | `l--flex`, `l--grid` |
| 4 | Trait Primitives（`is--`） | `is--wrapper`, `is--layer` |
| 5 | Set Class（`set--`） | `set--hov`, `set--card` |
| 6 | ユーティリティ（`u--`） | `u--cbox`, `u--trim` |
| 7 | Property Class（`-`） | `-p:20`, `-bgc:base-2` |

```html
<!-- OK -->
<div class="c--nav l--flex -p:20 -g:20">...</div>

<!-- NG: Property Class が先 -->
<div class="-p:20 -g:20 l--flex c--nav">...</div>
```

なお、`class` 属性内の並び順は CSS の適用結果（詳細度・カスケード順）には影響しません。この順序はあくまで可読性と一貫性のための整理です。


## カスタムCSS を追加する場合

独自のスタイルを追加する場合は、対象に合った Lism の CSS Layer 内に記述してください。

```css
/* カスタムコンポーネント → lism-components に追加 */
@layer lism-components {
  .c--my-card {
    border: 1px solid var(--brand);
    border-radius: var(--bdrs--20);
    padding: var(--s30);
  }
}

/* ベーススタイルの拡張 → lism-base に追加 */
@layer lism-base {
  .set--my-theme {
    --brand: #c00;
  }
}
```

カスタムCSS内でも、できる限り Lism のCSS変数（トークン）を使ってください。

```css
/* NG */
.c--my-card { padding: 24px; border-radius: 8px; }

/* OK */
.c--my-card { padding: var(--s30); border-radius: var(--bdrs--20); }
```

ただし、明確にその数値に意図がある場合は、生のCSS値を使用しても構いません。

**レイヤー外に書く場合:**
`@layer` の外（レイヤーなし）でカスタムCSSを書くのは、**Property Class（`-{prop}:{value}`）を拡張する場合のみ**としてください。それ以外のカスタムスタイルは必ずいずれかの `@layer` 内に記述します。

```css
/* OK: Property Class の拡張はレイヤー外 */
.-myProp\:myValue { ... }

/* NG: コンポーネントやユーティリティをレイヤー外に書かない */
.c--my-card { ... }
```


## CSS の配置場所

### グローバル CSS（サイト全体）

Lism のトークン変数のカスタマイズやベーススタイルの上書きは、サイト全体で読み込むグローバル CSS ファイルに記述します。（lism-cssの`main.css`ファイルよりあとで読み込むこと）。

```css
/* global.css などで適切な @layer で定義すること */
@layer lism-base {
  :root {
    --brand: #c00;
    --link-c: #0066cc;
    --fw--bold: 700;
  }
}
```

### コンポーネント CSS

コンポーネント固有のスタイルは、そのコンポーネントを定義しているファイルに紐づけます。

- `.jsx` / `.tsx` ファイル: CSS ファイルを `import` する
- `.astro` ファイル: `import` するか、コンポーネントファイル内の `<style>` タグに記述

```css
/* コンポーネント用CSS は lism-components 内に定義する */
@layer lism-components {
  .c--yourComponent {
    ...
  }
}
```
