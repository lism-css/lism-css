# CSS 設計ルール


## CSS Layer 構造

Lism CSS は CSS Layers による詳細度管理を採用しています。
カスタムCSSを追加する場合は、この順序を意識してください。

```
Settings（トークン定義）
  → @layer lism-base（Reset CSS・トークン・.set--クラス）
  → @layer lism-modules（.is-- / .l-- / .a-- / .c-- モジュール群）
  → @layer lism-custom（ユーザーカスタマイズ用）
  → @layer lism-utility（.u-- ユーティリティクラス）
  → Prop Class（レイヤー外 — 最も詳細度が高い）
```

詳細: https://lism-css.com/docs/css-methodology/


## 命名規則とプレフィックス

クラス名のプレフィックスによって、役割とレイヤーの所属が決まります。

| プレフィックス | レイヤー | 役割 | 例 |
|--------------|---------|------|-----|
| `.set--` | lism-base | ベーススタイル上書き・トークン再定義 | `.set--plain`, `.set--transition` |
| `.is--` | lism-modules | 付け外し可能な状態モジュール | `.is--container`, `.is--wrapper` |
| `.l--` | lism-modules | レイアウト構成モジュール | `.l--grid`, `.l--flex`, `.l--stack` |
| `.a--` | lism-modules | レイアウト最小単位モジュール | `.a--icon`, `.a--divider` |
| `.c--` | lism-modules | 具体的な役割のコンポーネント | `.c--button`, `.c--accordion` |
| `.u--` | lism-utility | 用途が明確なユーティリティ | `.u--cbox`, `.u--trim` |
| `.-` | レイヤー外 | 単一プロパティ制御（Prop Class） | `.-fz:l`, `.-p:20`, `.-d:none` |

**併用ルール:**
- `.l--` と `.c--` は併用OK（例: `<div class="l--flex c--nav">`）
- 同カテゴリ内の併用は不可（例: `.l--flex` と `.l--grid` は同要素に付けない）
- バリエーション: `.c--button.c--button--outline`
- 子要素: `.c--card_header`, `.c--card_body`

詳細: https://lism-css.com/docs/module-class/


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
