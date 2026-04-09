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
  → @layer lism-modules
      → @layer state（.is-- ステートモジュール）
      → @layer layout（.l-- レイアウトモジュール）
      → @layer atomic（.a-- アトミックモジュール）
      → .c-- は sublayer なし（lism-modules 直下、または lism-custom で定義）
  → @layer lism-custom（ユーザーカスタマイズ用）
  → @layer lism-utility（.u-- ユーティリティクラス）
  → Property Class（レイヤー外 — 最も詳細度が高い）
```


## 命名規則とプレフィックス

[詳細](https://lism-css.com/docs/module-class/)

クラス名のプレフィックスによって、役割とレイヤーの所属が決まります。

| プレフィックス | レイヤー | 役割 | 例 |
|--------------|---------|------|-----|
| `.set--` | lism-base | ベーススタイル上書き・トークン再定義 | `.set--plain`, `.set--transition` |
| `.is--` | lism-modules | 付け外し可能な状態モジュール | `.is--container`, `.is--wrapper` |
| `.l--` | lism-modules | レイアウト構成モジュール | `.l--grid`, `.l--flex`, `.l--stack` |
| `.a--` | lism-modules | レイアウト最小単位モジュール | `.a--icon`, `.a--divider` |
| `.c--` | lism-modules | 具体的な役割のコンポーネント | `.c--button`, `.c--accordion` |
| `.u--` | lism-utility | 用途が明確なユーティリティ | `.u--cbox`, `.u--trim` |
| `.-` | レイヤー外 | 単一プロパティ制御（Property Class） | `.-fz:l`, `.-p:20`, `.-d:none` |

**併用ルール:**
- `.l--` と `.c--` は併用OK（例: `<div class="l--flex c--nav">`）
- 同カテゴリ内の併用は不可（例: `.l--flex` と `.l--grid` は同要素に付けない）
- バリエーション: `.c--button.c--button--outline`
- 子要素: `.c--card_header`, `.c--card_body`

**記述順序:**
class 属性にクラスを直接記述する場合、Property Class（`-` プレフィックス）はモジュールクラスやユーティリティクラスの**後ろ**に書いてください。

```html
<!-- OK: モジュールクラス → Property Class -->
<div class="l--flex c--nav -p:20 -g:20">...</div>
<div class="l--box u--cbox -bd -p:20">...</div>

<!-- NG: Property Class が先 -->
<div class="-p:20 -g:20 l--flex c--nav">...</div>
```


## カスタムCSS を追加する場合

独自のスタイルを追加する場合は、対象に合った Lism の CSS Layer 内に記述してください。

```css
/* カスタムコンポーネント → lism-modules に追加 */
@layer lism-modules {
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
/* コンポーネント用CSS は lism-modules 内に定義する */
@layer lism-modules {
  .c--yourComponent {
    ...
  }
}
```
