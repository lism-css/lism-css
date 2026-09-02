基準日: 2026-09-02・b64df3b7

# Tooltip（#560）と Popover（#565）を `@lism-css/ui` に追加する

状態: Ready

対象Issue: [#560 Tooltip](https://github.com/lism-css/lism-css/issues/560) / [#565 Popover](https://github.com/lism-css/lism-css/issues/565)。2つを1つのPR（`dev`から切った`feat/tooltip-popover`、ターゲット`dev`）で実装する。Issue本文とこのプランが食い違う箇所はこのプランを正とする（Issue案を採らなかった主な理由は「設計判断の根拠」の却下欄にある）。

## 概要 / ゴール

- `b--tooltip`（ホバー/フォーカスで出る補足テキスト）と`b--popover`（クリックで開くインタラクティブなパネル）をReact / Astro両対応で追加する。
- 位置決めはCSS Anchor Positioning。非対応ブラウザにはCSSだけでフォールバックし、JSによる位置計算は持たない。
- TooltipのJSは「Escで閉じる」だけ。PopoverはクライアントJSゼロ（ネイティブPopover API）。
- 完了時: 2コンポーネントがパッケージに収録され、docs（ja/en）・skill・MCP索引・`packages/lism-ui`のREADME・カタログ（Storybook）が追随している。

## 背景・前提

すべて実コード・一次情報で裏取り済み。以降の節はこれを前提にする。

### 流用する既存コード

- **コンパウンドAPI**: `Modal = { Root, Inner, Body, CloseBtn, OpenBtn }`のようなオブジェクトを`export { Modal }`し、`<Modal.Root>`で使う（`react/index.ts`・`astro/index.ts`）。新コンポーネントも同じ形にする。
- **ID配線**: Astroは`Accordion/astro/Item.astro`が`Astro.slots.render('default')`→`__LISM_ACC_ID__`を`escapeHtmlAttr`で置換→`set:html`。Reactは`Accordion/react/Item.tsx`が`useId()`をContext（`react/context.ts`）で子へ配る。仕組みは両方流用する。ただしAccordion Reactの子は`ctx?.accID || 自身のprop`（Context優先）で、Astro（子の明示ID優先）と食い違っている。新コンポーネントは共通方針6で「子のprop優先」に統一する。
- **クライアントJS**: `Modal/setModal.ts`（`setEvent(target)`＋全件登録の`setModal()`）、`Modal/script.ts`（`DOMContentLoaded`で`setModal()`）。Astroは`Modal.astro`内`<script>`、Reactは`useEffect`で呼ぶ。
- **inline styleのCSS変数**: Modal Rootの`duration` propは`style`に`'--duration'`をマージして出力する。新コンポーネントの`delay`・`offset` propも同じ方式にする。
- **閉じるボタン**: `Modal/react/CloseBtn.tsx`は`icon`（既定`x`）・`srText`（既定`Close`）を持つ。`Popover.Close`はこれを流用する。
- **Reactテスト**: `Tabs/react/Root.test.tsx`の`createRoot`+`act`方式に倣う。

### ビルド・docs・カタログの追随箇所

- **`vite.config.js`の`entries`は手動**: `scripts/modal`等が列挙されている。Tooltipの`script.ts`は`'scripts/tooltip'`を手で追加しないとビルドされない。
- **自動生成物**: `registry-index.json`と`package.json`の`exports`は`pnpm build`（lism-ui）で再生成されcommit対象。`generate-exports.ts`は`astro/index.ts`と`react/index.ts`の両方があるディレクトリだけを対象にする。
- **docsの置き場所**: `apps/docs/src/content/ja/ui/Tooltip.mdx`のように`ui/`直下。サイドバーは`src/config/sidebar.ts`が`ui/`直下を自動取得するので編集不要。`ui/components/`はCSSレスの実装例用で対象外。
- **Storybook**: `apps/catalog/.storybook/main.js`が`packages/lism-ui/src/components/**/*.stories.tsx`をglobで拾う。`Modal.stories.tsx`に倣って各コンポーネント直下に置けば登録不要。
- **README**: コンポーネント一覧表があるのは`packages/lism-ui/README.md`と`packages/lism-ui/README.ja.md`。ルート`README.md`・`README.ja.md`は`@lism-css/ui`の概要行（Accordion, Modal, Tabs, etc.）だけなので変更しない。
- **lint**: stylelintは`anchor-name`/`anchor-scope`/`position-area`/`position-try-fallbacks`/`@starting-style`/`:popover-open`/`@supports not (...)`を通す（stdinで実行確認済み）。`eslint-plugin-react@7.37.5`の`no-unknown-property`は`popover`/`popoverTarget`/`popoverTargetAction`を既知属性として持つ。

### CSSの前提

- **`set="plain"`**: `.set--plain`（`@layer lism-base`）が`width: auto; margin: 0; padding: 0; border: none; background: none`等を当てる。`lism-block`レイヤーはその上位なので、`b--`側の宣言が勝つ。
- **レイヤー順**: `lism-base, lism-block, lism-trait, lism-primitive, lism-component, lism-custom, lism-utility`。`b--`のベーススタイルは利用者のLism props（`bg`・`p`・`bdrs`等）に常に負ける設計なので、色・余白の上書き用CSS変数を大量に用意する必要はない。

### 外部仕様

- **ブラウザ対応**（caniuse・MDN）: Anchor PositioningはChrome/Edge 125、Safari 26、Firefox 147、グローバル84%。`anchor-scope`と`position-area`はBaseline 2026年1月。Chrome 125〜130は`anchor-scope`未対応で、うち128〜130は`position-area`・`position-try-fallbacks`・`position-anchor`を解釈する「部分対応」（範囲はOddBirdの対応表による）。
- **MDN**: `position-area`でpopoverを配置する際は`margin: 0; inset: auto;`でUA既定を解除する。`position-area`の構文例に`inline-start`（＝`inline-start span-all`）と`top span-x-start`があり、論理キーワードは物理キーワードと同じ扱い。
- **OddBirdポリフィル**（README）: `CSS.supports`と`@supports`はポリフィルされず、`@supports`ブロック内のCSSはポリフィル処理を受けない。`anchor-scope`・`position-area`（制約あり）・基本的な`position-try-fallbacks`・popover（トップレイヤー）は対応。`justify-self: anchor-center`は非対応。動的追加ノードは非対応。
- **Base UIの命名**（公式docs）: Tooltip / Popoverとも`side`は`top | bottom | left | right | inline-start | inline-end`（既定はTooltip=`top`、Popover=`bottom`）、`align`は`start | center | end`（既定`center`）。中身は`Popup`、Popoverの閉じるボタンは`Close`。

## 共通方針（両コンポーネントに適用）

### 1. Anchor配置とフォールバックのゲート

anchor配置のルールを`@supports (...)`で囲い、フォールバックのルールを同じ条件の`@supports not (...)`で囲う。両ブロックは排他なので、片方の宣言をもう片方で打ち消す必要がない。

- `@supports`の条件は使用プロパティを全部andで束ねる: `(anchor-name: --a) and (anchor-scope: all) and (position-area: inline-start span-block-end) and (position-try-fallbacks: flip-block)`。`position-area`の判定値に論理キーワードを含め、`inline-*`側だけ壊れる状態を作らない。`anchor-scope`未対応のChrome 125〜130（うち128〜130は`position-area`等を解釈する部分対応）もこの条件でまとめてフォールバック側に落ちる。
- anchor配置側（`@supports`内）に置くもの: `position`（Tooltipの`fixed`）・`position-anchor`・`position-area`・`position-try-fallbacks`・オフセットmargin・`place-self`・Popoverの`inset: auto`。`position`・`inset`・`margin`・`place-self`等は未対応ブラウザでも効いてしまうので、anchor系プロパティだけを囲う構成にはしない。
- `anchor-scope`（ルート）と`anchor-name`（トリガー）はゲートの外に書く。未対応ブラウザでは未知プロパティとして無視されるだけで害はない。
- `position-area`は`--_side`と`--_span`のvar()で合成し、`data-side`・`data-align`ごとに変数だけを切り替える（組み立ては共通方針4）。

```css
@layer lism-block {
  .b--tooltip_popup {
    /* 見た目・表示制御（ゲートなし） */
  }
  @supports (anchor-name: --a) and (anchor-scope: all) and (position-area: inline-start span-block-end) and (position-try-fallbacks: flip-block) {
    .b--tooltip_popup {
      position: fixed;
      position-anchor: --tooltip;
      position-area: var(--_side) var(--_span);
    }
    .b--tooltip_popup:where([data-side='top']) {
      --_side: top;
    }
  }
  @supports not ((anchor-name: --a) and (anchor-scope: all) and (position-area: inline-start span-block-end) and (position-try-fallbacks: flip-block)) {
    .b--tooltip_popup {
      position: absolute;
      /* 方向別の inset・translate */
    }
  }
}
```

### 2. ポリフィル対応はしない

- OddBirdポリフィルを前提にした構成（anchor配置側をゲートなしで書き、フォールバックを`:root:not([data-anchor-polyfill])`で外す「ゲート反転」）は実機で動かなかったため廃止し、共通方針1の形にした（2026-09-02。理由は設計判断の却下欄）。
- docsにポリフィルの案内は載せない。非対応ブラウザではCSSフォールバック（Tooltipはルート基準の絶対配置、Popoverは画面中央のカード）で表示自体は成立する。

### 3. anchor名は`anchor-scope`で静的CSSに閉じる

- ルート: `anchor-scope: --tooltip` / `--popover`。トリガー: `anchor-name`。ポップアップ: `position-anchor`。全部`_style.css`に書き、inline styleでは出さない。
- Popoverのポップアップはトップレイヤーに乗るが、`anchor-scope`はDOMツリー基準なので問題ない（MDN記載。実機で要確認）。

### 4. 方向のprop名と値はBase UIに揃える（`side`の論理値だけ短縮）

- **`side`**: `top | bottom | left | right | start | end`。Tooltipの既定`top`、Popoverの既定`bottom`。`left`/`right`は物理方向、`start`/`end`は書字方向（`dir="rtl"`）に追従するinline軸の論理方向（CSSの`position-area`では`inline-start`/`inline-end`）。Base UIの`inline-start`/`inline-end`は採用しない（理由は設計判断の根拠）。
- **`align`**: `start | center | end`、既定`center`。`side`が`top`/`bottom`のとき`start`/`end`は書字方向に追従する（`span-x-*`と`place-self`のjustify側で実現）。`side`が横方向のときは縦方向の揃えになり、`start`=上・`end`=下（`place-self`のalign側で実現）。
- DOMには`data-side` / `data-align`として出す。コンポーネント接頭辞は付けない（`.b--popover_popup[data-side]`のようにクラスでスコープされるため衝突しない）。

`side`×`align`→`position-area`の対応表（両コンポーネント共通。揃えは効かせるlonghandで表記し、実装は`place-self`で切り替える）:

| side | center | start | end |
| --- | --- | --- | --- |
| `top` | `top` | `top span-x-end`＋`justify-self: start` | `top span-x-start`＋`justify-self: end` |
| `bottom` | `bottom` | `bottom span-x-end`＋`justify-self: start` | `bottom span-x-start`＋`justify-self: end` |
| `left` | `left` | `left span-bottom`＋`align-self: start` | `left span-top`＋`align-self: end` |
| `right` | `right` | `right span-bottom`＋`align-self: start` | `right span-top`＋`align-self: end` |
| `start` | `inline-start` | `inline-start span-block-end`＋`align-self: start` | `inline-start span-block-start`＋`align-self: end` |
| `end` | `inline-end` | `inline-end span-block-end`＋`align-self: start` | `inline-end span-block-start`＋`align-self: end` |

- `center`列は単一キーワード（＝`span-all`）。直交軸は`anchor-center`の既定挙動でviewport内に自動シフトするので、`anchor-center`は明示しない。
- `start`/`end`は`normal`の既定揃えに頼らず`place-self`で揃えを明示する。
- CSSの組み立て（`@supports`内、両コンポーネント共通）: `position-area: var(--_side) var(--_span)`（`--_side`は主軸、`--_span`は交差軸のキーワード。後者は値が常に`span-*`になるのでこの名。既定は`span-all`）。`data-side`ごとに`--_side`を`center`列の値にする。side系統ごとのルールで、`align`が`start`/`end`のときの候補を`--_spanStart`/`--_spanEnd`（`span-*`。上下系・`left`/`right`・`start`/`end`の3グループ）と`--_placeStart`/`--_placeEnd`（`place-self`の値。上下系は`auto start`/`auto end`、横方向は`start auto`/`end auto`の2グループ）に定義し、`data-align`の`start`/`end`は`--_span: var(--_spanStart); place-self: var(--_placeStart)`のように選ぶだけにする。side×alignの組み合わせルールは持たない。変数は内部変数なので`--_{varName}`の命名に従う。
- `position-try-fallbacks`: `align`の`start`/`end`で直交軸にも溢れ得るので、両軸のflipまで並べて主軸を先に書く（`top`/`bottom`: `flip-block, flip-inline, flip-block flip-inline`。横方向のside: `flip-inline, flip-block, flip-inline flip-block`）。
- オフセットは主軸のmarginで作る: `top`/`bottom`→`margin-block`、`left`/`right`/`start`/`end`→`margin-inline`。値は`--tooltip-offset` / `--popover-offset`（共通方針7）。両側に当ててもアンカー側は間隔、反対側はviewport端との余白になるだけなので、side別に書き分けずflip後もそのまま効く。`position-try-fallbacks`も同じ2グループにまとめる。

### 5. パーツ名とクラス名

- Tooltip: `Tooltip.Root` / `Tooltip.Trigger` / `Tooltip.Popup`
- Popover: `Popover.Root` / `Popover.Trigger` / `Popover.Popup` / `Popover.Close`
- クラス名: `b--tooltip` / `b--tooltip_trigger` / `b--tooltip_popup`、`b--popover` / `b--popover_trigger` / `b--popover_popup` / `b--popover_close`。
- `Popover.Close`の実装は`Modal.CloseBtn`（`x`アイコン＋`srText`）を流用し、名前だけBase UIに合わせる（理由は設計判断）。

### 6. ID配線

- Root prop `tooltipId` / `popoverId`（省略時は自動生成）。Accordionの`accID`・Modalの`modalId`と同じ流儀。
- 子のID props: Popupは標準の`id`、Trigger / Closeは`tooltipId` / `popoverId`。
- Astro: Rootで`Astro.slots.render('default')`→`__LISM_TOOLTIP_ID__` / `__LISM_POPOVER_ID__`を`escapeHtmlAttr(id)`で関数置換→`set:html`。プレースホルダーがなければ通常の`<slot />`（Accordion Itemと同じ二分岐）。子側の既定値はプレースホルダー文字列。子に明示IDがあればプレースホルダーが出ないので、置換されず子の値が残る。
- React: Rootで`useId()`→`context.ts`（`'use client'`）で配布。子は`自身のprop || ctx?.id || プレースホルダー`。
- **契約（React/Astro共通）: 子の明示IDはRootのIDより優先される。** これはAstroの置換方式で強制できる唯一の順序なので、Reactも同じにする。したがって:
  - Root配下でIDを指定する手段は`tooltipId` / `popoverId`だけ。子のID propsはRoot外で単体利用する（自分で`Trigger`・`Popup`・`Close`へ同じIDを渡す）ときの手段。
  - Root配下で一部の子にだけIDを渡すと`aria-describedby` / `popovertarget`とPopupの`id`が食い違い、配線が壊れる。docsのProps節に「Root配下では子にIDを指定しない」と明記する。

### 7. スタイルの上書き手段

- 色・余白・角丸・影はLism props（`bg`・`c`・`p`・`bdrs`・`shadow`等）で上書きできる。CSS変数フックはLism propsで表現できないものだけにする: `--tooltip-offset`・`--tooltip-delay`・`--tooltip-delay-out`・`--tooltip-duration`、`--popover-offset`・`--popover-duration`。
- 既定色は既存トークン（`--base`・`--text`系）で組む。Tooltipは反転配色（濃い背景に明るい文字）、Popoverは`Modal.Inner`と同じ`background-color: var(--base)`。トークン名は実装時に`skills/lism-css-guide/tokens.md`で確認する。
- 余白は`--s10`・`--s15`等の既存spacingトークンを使う（Accordionと同じ）。

## Tooltip 実装

### 出力HTML

```html
<span class="b--tooltip">
  <button type="button" class="b--tooltip_trigger set--plain" aria-describedby="tt-xxxx">保存</button>
  <span class="b--tooltip_popup" role="tooltip" id="tt-xxxx" data-side="top" data-align="center">ショートカット: ⌘S</span>
</span>
```

- `aria-describedby`は非表示要素でも解決されるので、JSなし・フォーカスだけで内容を取得できる。
- Escで閉じた状態はルートの`data-dismissed`で表す。

### CSS（`Tooltip/_style.css`、`@layer lism-block`）

- ルート: `display: inline-block; anchor-scope: --tooltip;`（フォールバック用の`position: relative`は`@supports not`内に置く）
- トリガー: `anchor-name: --tooltip;`（表示スタイルは`set="plain"`任せ）
- ポップアップ（ゲートなし）: `z-index; width: max-content; max-width: min(20rem, 90vw); padding; border-radius; 配色; font-size`と表示制御。
- ポップアップ（anchor配置・`@supports`内）: `position: fixed; position-anchor: --tooltip;`に共通方針4の組み立て（`position-area`・`place-self`・`position-try-fallbacks`・オフセットmargin）を足す。
- ポップアップ（フォールバック・`@supports not`内）: ルートに`position: relative`、ポップアップに`position: absolute`。side軸とalign軸を別ルールにして打ち消しを不要にする（オフセットは持たない）:
  - side軸: `top`→`bottom: 100%`、`bottom`→`top: 100%`、`left`→`right: 100%`、`right`→`left: 100%`、`start`→`inset-inline-end: 100%`、`end`→`inset-inline-start: 100%`
  - align軸（`top`/`bottom`）: `center`→`left: 50%; translate: -50% 0`、`start`→`inset-inline-start: 0`、`end`→`inset-inline-end: 0`
  - align軸（横方向のside）: `center`→`top: 50%; translate: 0 -50%`、`start`→`top: 0`、`end`→`bottom: 0`
  - `data-align`が無い生HTMLではalign軸のルールが当たらずstatic positionに落ちる。コンポーネントは常に`data-align`を出すので、docsのHTML例にも常に書く。
- 表示制御（CSSのみ。Popupは同じRoot直下に置く前提）:
  - 非表示既定: `visibility: hidden; opacity: 0; transition: opacity var(--tooltip-duration, .15s), visibility var(--tooltip-duration, .15s); transition-delay: var(--tooltip-delay-out, .15s)`（退場猶予＝トリガー→ポップアップへポインタを渡す橋渡し）。`pointer-events`は使わない。transitionしないため退場猶予中に当たり判定が消え、橋渡しが効かなくなる。当たり判定の除外は`visibility: hidden`で足りる。
  - 隙間の橋: anchor配置側で`.b--tooltip_popup::before`（`position: absolute; inset: calc(-1 * var(--offset)); z-index: -1`）を置き、offsetぶんの隙間を透明な当たり判定で埋める。トリガー→ポップアップの移動中にRootの`:hover`が外れないので、退場猶予は横断中の保険ではなく別経路からの復帰用になる。flipでどちら側に出ても効くよう全方向へ広げる。フォールバック側は隙間が無いので置かない。
  - 表示: `.b--tooltip:hover > .b--tooltip_popup`と`.b--tooltip_trigger:focus-visible ~ .b--tooltip_popup`で`visibility: visible; opacity: 1; transition-delay: var(--tooltip-delay, .4s)`（入場ディレイ）。`:has()`は使わない（隣接/一般兄弟結合子で足りる）。
  - Esc後: `.b--tooltip[data-dismissed] > .b--tooltip_popup`で強制非表示（`transition: none`）。表示ルールより後に置く。詳細度が並ばない場合は表示ルール側の疑似クラスを`:where`で包んで揃える。
- `@media (prefers-reduced-motion: reduce)`: `--tooltip-duration: 0s`（ディレイは残す）。
- `@media (scripting: none)`: 何もしない（Esc以外はJSなしで動く）。

### JS（`Tooltip/setTooltip.ts`・`script.ts`）

documentに1回だけ登録する委譲リスナー方式。ホバー中はフォーカスがbodyにあり、ルート要素のkeydownでは拾えない。

- `setTooltip(): void`: 最初の呼び出しで1回だけdocumentへリスナーを登録し、ページ存続中は保持する（永続シングルトン）。モジュール内フラグで二重登録を防ぐ。戻り値は`void`にし、Reactのeffect cleanupに渡しても何も起きない形にする（`return setEvent(...)`というModalの書き方を写しても安全）。登録するのは3つ:
  - `document` `keydown`（`Escape`）: すべての`.b--tooltip`に`data-dismissed`を付ける。
  - `document` `pointerenter`（capture）: `e.target`が`.b--tooltip`なら`data-dismissed`を外す。
  - `document` `focusin`: `e.target.closest('.b--tooltip')`の`data-dismissed`を外す。
- `unsetTooltip()`（名前付きexport）: リスナー3つを外してフラグを戻す。テストのリセット専用でコンポーネントからは呼ばない（JSDocで明記）。
- 動作: Escで全ルートに印を付け、次にポインタ/フォーカスが入った瞬間に外す。見た目上は「Escで消えて、いったん離れて戻ると再表示」になる。`:hover`のJS判定（jsdomで再現不可）を避けられる。
- `script.ts`: `DOMContentLoaded`で`setTooltip()`（Modalと同一）。`vite.config.js`の`entries`に`'scripts/tooltip'`を追加。
- Astro: `Root.astro`内`<script>`で`setTooltip()`。React: `Root.tsx`の`useEffect(() => { setTooltip(); }, [])`（`'use client'`、refは不要、cleanupは返さない）。Strict Modeの二重実行や複数Rootの同時mountはフラグで吸収される。

### コンポーネント構成とprops

```
components/Tooltip/
├── react/  Root.tsx / Trigger.tsx / Popup.tsx / context.ts / index.ts / Root.test.tsx
├── astro/  Root.astro / Trigger.astro / Popup.astro / index.ts
├── _style.css
├── setTooltip.ts / setTooltip.test.ts
├── script.ts
└── Tooltip.stories.tsx
```

| パーツ | 既定`as` | 固有props | 出力 |
| --- | --- | --- | --- |
| `Root` | `span` | `tooltipId`, `delay`（→`--tooltip-delay`をinline style） | `class="b--tooltip"` |
| `Trigger` | `button` | `tooltipId` | `type="button"` `set="plain"` `aria-describedby` |
| `Popup` | `span` | `id`, `side`（既定`top`）, `align`（既定`center`）, `offset`（→`--tooltip-offset`をinline style） | `role="tooltip"` `data-side` `data-align` |

- `Trigger`を`as="span"`等の非フォーカス要素にした場合はキーボードで出せなくなる。docsで「フォーカス可能要素にする（`tabindex="0"`）」を案内する。

### テスト

- `setTooltip.test.ts`（vitest + jsdom）: Escで全ルートに`data-dismissed`が付く / `pointerenter`で該当ルートだけ外れる / `focusin`で外れる / 二重呼び出しでリスナーが増えない（`document.addEventListener`をspyして`keydown`登録が1回） / `unsetTooltip()`で外れ、再度`setTooltip()`で登録できる。各テストの`afterEach`で`unsetTooltip()`。
- `react/Root.test.tsx`:
  - ID配線: Triggerの`aria-describedby`とPopupの`id`が一致する / `tooltipId`明示が反映される / Root配下でPopupにだけ`id`を渡すと子の値が優先される（共通方針6の契約を固定） / Root外で`Trigger`と`Popup`に同じ`tooltipId`・`id`を渡すと一致する / `side`・`align`の既定と`data-*`出力。
  - リスナー所有: Rootを2つmount→片方をunmount→documentで`Escape`を発火→残ったRootに`data-dismissed`が付く / `<StrictMode>`でRootをmountしても`keydown`登録が1回。

## Popover 実装

### 出力HTML

```html
<div class="b--popover">
  <button type="button" class="b--popover_trigger set--plain" popovertarget="pop-xxxx">開く</button>
  <div class="b--popover_popup" id="pop-xxxx" popover="auto" data-side="bottom" data-align="center">
    コンテンツ
    <button type="button" class="b--popover_close set--plain" popovertarget="pop-xxxx" popovertargetaction="hide">…</button>
  </div>
</div>
```

- 開閉・light dismiss・Esc・フォーカス復帰・Tab順・`aria-expanded`はすべてネイティブ（`popover="auto"`の挙動）。`type="manual"`ではlight dismissとEscによる自動クローズが無効になり、`Close`（または`popovertarget`ボタン）でしか閉じない。`role`は既定で付けない。
- React側の属性名は`popover` / `popoverTarget` / `popoverTargetAction`（React 19の正式prop）。React 18ではdev時に未知prop警告が出るがDOMには出力される（受容）。Astro側は小文字。

### CSS（`Popover/_style.css`、`@layer lism-block`）

- ルート: `display: inline-block; anchor-scope: --popover;`。トリガー: `anchor-name: --popover;`
- ポップアップ（ゲートなし）: 見た目（`border: none`・padding・`background-color: var(--base)`・`color: var(--text)`・box-shadow・`overflow: auto`）と開閉アニメーション。`set="plain"`は使わない（理由は設計判断）。UA既定の`margin: auto`はlism-cssのreset（`*:not(dialog) { margin: 0 }`）で消えている。
- ポップアップ（anchor配置・`@supports`内）: `position-anchor: --popover; inset: auto;`（UA既定の`inset: 0`を解除）に共通方針4の組み立て（`position-area`・`place-self`・`position-try-fallbacks`・オフセットmargin）を足す。
- ポップアップ（フォールバック・`@supports not`内）: `margin: auto`（resetで消えたUA既定値を戻す）と`max-width`/`max-height`でUA既定の中央配置をカードとして整え、`::backdrop`に薄い半透明を当てる。
- 開閉アニメーション: `opacity`の`transition`（時間は`--popover-duration`）＋`display` / `overlay`を`allow-discrete`、`:popover-open`で`opacity: 1`、`@starting-style { opacity: 0 }`。`@media (prefers-reduced-motion: reduce)`で`--popover-duration: 0s`。

### コンポーネント構成とprops

```
components/Popover/
├── react/  Root.tsx / Trigger.tsx / Popup.tsx / Close.tsx / context.ts / index.ts / Root.test.tsx
├── astro/  Root.astro / Trigger.astro / Popup.astro / Close.astro / index.ts
├── _style.css
└── Popover.stories.tsx
```

`script.ts`・`set*.ts`は作らない。

| パーツ | 既定`as` | 固有props | 出力 |
| --- | --- | --- | --- |
| `Root` | `div` | `popoverId` | `class="b--popover"` |
| `Trigger` | `button` | `popoverId` | `type="button"` `set="plain"` `popovertarget` |
| `Popup` | `div` | `id`, `side`（既定`bottom`）, `align`（既定`center`）, `offset`（→`--popover-offset`をinline style）, `type`（`auto \| manual`、既定`auto`→`popover`属性値） | `popover` `data-side` `data-align` |
| `Close` | `button` | `popoverId`, `icon`, `srText`（`Modal.CloseBtn`と同じ。slotがあればそれを表示） | `type="button"` `set="plain"` `popovertarget` `popovertargetaction="hide"` |

- `Trigger`/`Close`を`button`以外にすると`popovertarget`が効かない。docsで明記する。

### テスト

- `react/Root.test.tsx`: Triggerの`popovertarget`・Popupの`id`・Closeの`popovertarget`が一致する / `popoverId`明示が反映される / Root配下でPopupにだけ`id`を渡すと子の値が優先される（共通方針6の契約を固定） / Root外で`Trigger`・`Popup`・`Close`に同じIDを渡すと一致する / `popover="auto"`既定と`type="manual"` / `side`・`align`の既定と`data-*`出力。
- CSS挙動（配置・flip・フォールバック）は自動テストしない。「完了条件」の実機確認で担保する。

## 追随ファイル一覧（PR内で全部やる）

| 場所 | 作業 |
| --- | --- |
| `packages/lism-ui/src/style.scss` | `@use`を2行追加（収録漏れ注意） |
| `packages/lism-ui/src/components/react.ts` / `astro.ts` | export追加 |
| `packages/lism-ui/vite.config.js` | `entries`に`'scripts/tooltip'`追加 |
| `packages/lism-ui/registry-index.json` / `package.json`の`exports` | `pnpm build`で再生成してcommit |
| `apps/docs/src/content/ja/ui/Tooltip.mdx` / `Popover.mdx` | 新規。構成は`Modal.mdx`に倣う: Overview（`Preview`）→`:::note`で仕様上の注意→Styles（`SrcCode`）→How to use（`ImportPackage`。Tooltipは`script="tooltip.js"`、Popoverは`css`のみ）→Props（`PropBadge`で対象パーツを示す）→Examples |
| `apps/docs/src/content/en/ui/Tooltip.mdx` / `Popover.mdx` | ja確定後に`lism-docs-translator`で作成 |
| `skills/lism-css-guide/components-ui.md` | `## Tooltip` / `## Popover`節（ソースリンク・構造・Prop表・最小例）。`SKILL.md`のTOCにも追加 |
| `packages/mcp/src/data/docs-index.json` | `/mcp-update`で2エントリ追加（`meta.ts`更新と`pnpm --filter @lism-css/mcp test`まで） |
| `packages/lism-ui/README.md`・`packages/lism-ui/README.ja.md` | コンポーネント一覧表に2行追加 |

### docsに書く利用ガイダンス

- Tooltip: 中にリンク・ボタンを置かない（それはPopover）。重要な情報をツールチップだけに入れない（タッチでは確実に見えない）。トリガーはフォーカス可能要素にする（`tabindex="0"`）。
- Popover: 重要な操作・情報をポップオーバーだけに置かない。フォームを含む用途では`role="dialog"`＋`aria-label`を付ける例を載せる。本文の説明は`type="auto"`の挙動として書き、Props節で`type="manual"`との差（light dismiss・Escによる自動クローズが無効。`Close`を必ず置く）を明記する。`Trigger`/`Close`は`button`でなければ動かない。
- 共通: Root配下では子にIDを指定しない（共通方針6）。`side`の`left`/`right`は物理方向、`start`/`end`と`align`は書字方向に追従する。非対応ブラウザでの見え方（Tooltipは反転しない・クリップされ得る、Popoverは画面中央カード）。ポリフィルの案内は載せない（共通方針2）。

## 作業手順

1. `dev`から`feat/tooltip-popover`を切る。
2. Tooltip: `_style.css`→Astro/Reactコンポーネント→`setTooltip.ts`＋`script.ts`＋`vite.config.js`→テスト→stories。
3. Popover: `_style.css`→Astro/Reactコンポーネント→テスト→stories。
4. 収録: `style.scss`・`react.ts`・`astro.ts`。`pnpm --filter @lism-css/ui build`で`registry-index.json`と`exports`を再生成。`dist/style.css`で`@supports`（肯定・`not`）の両ブロックと`@starting-style`が残っていることを確認（cssnano経由）。
5. docs（ja）を書き、`nr dev:docs`で表示確認。ここで「完了条件」の実機確認を行い、ディレイ既定値・オフセット・配色を調整する。実機確認はユーザーが行う（エージェントは指示があった場合のみ）。
6. docs（en）・skill・MCP・READMEを更新。`format:mdx`を使う場合は対象2ファイル以外の差分を戻す。
7. `nr lint` / `nr typecheck` / `nr test` / `nr build`を通し、PR本文に`Closes #560` `Closes #565`を書いて`dev`へ出す。

## 設計判断の根拠

### 採用

- **anchor配置側を`@supports`で囲う（共通方針1）**: フォールバック側と排他になるので打ち消し宣言が要らず、部分対応ブラウザもAND条件でまとめてフォールバックへ落ちる。`position-area`は`--_side`/`--_span`のvar()で合成し、Popoverでside×alignごとに18ルールに膨らんでいた重複を圧縮する。当初は`--_span`と揃えをside×alignの6ルールで切り替えていたが、side系統側に`--_spanStart`/`--_spanEnd`・`--_placeStart`/`--_placeEnd`の候補を置いて`data-align`側は選ぶだけにし、組み合わせルールを無くした（2026-09-02）。Tooltipも同じ形にして2コンポーネントの構造を揃える。
- **Tooltipにも`align`を持たせる**: Base UIはTooltip / Popoverとも`align`を持つ。Issue #560の提案に無かっただけで除外する理由は無く、anchor側のCSSはPopoverと同じ`--_span`の組み立てを足すだけ。フォールバックはside軸とalign軸を別ルールにすれば宣言数は増えない（2026-09-02に追加）。
- **ID優先順は「子の明示propが優先」で統一**: Astroのプレースホルダー置換は子に明示IDがあると置換されず、Root側から上書きする手段がない。Reactだけ「Root優先」にすると同じマークアップで配線結果が変わるので、ReactをAstroに合わせる。Root配下で子にIDを渡す使い方は契約外としてdocsに明記する。
- **Tooltipの表示判定をCSSに寄せ、JSは「Escで全ルートに印を付ける」だけにする**: JSで`:hover`を問い合わせる方式はjsdomでテストできず、ルート個別のリスナー管理（React unmount時のcleanup）も要る。document 1回登録なら状態を持たない。
- **documentリスナーは永続シングルトン（Rootのunmountで解除しない）**: 各Rootのcleanupで解除すると、複数Rootの片方をunmountしただけで残りのTooltipのEscが死ぬ。参照カウント方式は状態管理が増えるわりに、常駐リスナー3つのコストは無視できる。`setTooltip()`を`void`にして誤ってcleanupに渡せないようにし、解除はテスト専用の`unsetTooltip()`に分ける。
- **単一キーワードの`position-area`（span-all）**: 単一列（`bottom center`）だとポップアップがアンカー幅の列からはみ出しても横にシフトしない。span-allなら`anchor-center`既定でviewport内に収まる。
- **`side`の論理値は`start`/`end`にし、`align`の`start`/`end`を`span-x-*`で書字方向に追従させる**: RTLでも位置決めCSSを書き分けずに済み、フォールバックも論理inset（`inset-inline-*`）で書けるので追加コストが小さい。値名をBase UIの`inline-start`/`inline-end`から短縮するのは、`side`のblock軸が`top`/`bottom`の物理値しか無く`start`/`end`がinline軸にしか解釈できないため`inline-`が冗長で、Lism本体の`-ps`/`-bd-s`等も`s`/`e`だけで`inline-start`/`inline-end`を表しているため。`align`の`start`/`end`と字面が重なるが、別属性なので衝突しない（2026-09-02に変更）。
- **Popoverのポップアップに`set="plain"`を使わない**: `width: auto`がUAの`inset: 0`と組み合わさると全幅になり、フォールバックの中央カードが壊れる。
- **`Trigger`/`Popup`/`Close`と`side`/`align`の語彙**: Base UIと同じで、2コンポーネント間でも揃う。`Popup`にするのは、`Content`だと「常に見えている側」か「出てくる側」か分からないため。`Close`にするのは、`Modal`の`OpenBtn`/`CloseBtn`は対の命名であり、`Trigger`と組む`Popover`で片方だけ`Btn`を付ける理由がないため。

### 却下

- **`<Tooltip><TooltipTrigger>`形式のフラットなコンポーネント名**（Issue #560）: 既存の`Modal.Root`形式のコンパウンドAPIに合わせる。
- **`popover`属性でTooltipを作る**（Issue #560）: hoverで開く手段がなく常時JS必須。非対応ブラウザではUA既定（画面中央）で壊れる。
- **ルートごとに`keydown`を登録する**（Issue #560）: ホバー中はフォーカスがbodyにあり、ルート要素では拾えない。
- **`data-pos`（Tooltip）と`data-side`（Popover）の使い分け**（Issue #560）: 同じ概念に別名を付けない。
- **`data-side`/`data-align`を`data-position="{side} {align}"`に統合し`^=`/`$=`で照合する**: 組み合わせの数は変わらずルールは減らない。`start`/`end`がsideとalignの両方にあるため`$='start'`がside単独の`start`にも一致し、区切り文字や先頭スペース付きの照合が要る。変更範囲もCSSに閉じない（2026-09-02）。
- **`side`の論理値をBase UIどおり`inline-start`/`inline-end`にする**: 理由は採用欄の`side`の論理値の項。
- **OddBirdポリフィル対応（ゲート反転＋`data-anchor-polyfill`のopt-in属性）**: 当初はanchor配置側をゲートなしで書き、フォールバックを`@supports not`と`:root:not([data-anchor-polyfill])`で囲う構成にしていた（`@supports`内のCSSはポリフィルが処理しないため）。実機ではPopoverのポップアップが左下に固まりスクロールにも追従しなかった（トップレイヤー上のpopoverをポリフィルの既定設定が扱えない）。ゲート反転は「anchor側の宣言を全部フォールバックで打ち消す」制約を生むだけになるので廃止し、非対応ブラウザでもCSSフォールバックで表示自体は成立することからポリフィル前提をやめた（2026-09-02）。
- **JSによる位置計算フォールバック**: Floating UIの再発明。非対応時はCSSフォールバックで表示自体は正常。
- **矢印（しっぽ）**: flip適用をCSSで検知できず向きを切り替えられない。両方とも見送り。
- **Tooltipの`label` propショートカット**（`<Tooltip.Root label="...">`でPopupを自動出力）: RootでPopupを自動生成するとAstro側のプレースホルダー置換と二重管理になる。既存コンポーネントにも同種のショートカットはない。後から非破壊で足せる。
- **ポップアップ側を`Content`、閉じるボタンを`CloseBtn`と呼ぶ**: 理由は採用欄の語彙の項。
- **このPRで`Modal.OpenBtn`/`CloseBtn`も`Open`/`Close`系に改名する**: 公開済みパッケージの破壊的変更で、docs・skill・MCP・registryの追随も別途要る。別Issueで扱う。
- **`interestfor`属性**: Chrome/Edge 142のみ。マークアップは互換に保つ（`button`トリガー＋`role="tooltip"`）。

## 未決事項・要確認・事前準備

### 確定済み（2026-09-02にユーザー確認）

- 共通方針4〜6の命名（`side`/`align`と値域、`side`の論理値を`start`/`end`にすること（同日に`inline-start`/`inline-end`から変更）、`Root`/`Trigger`/`Popup`/`Close`、`tooltipId`/`popoverId`）。
- Tooltipの`label`ショートカットは入れない。Modalの`OpenBtn`/`CloseBtn`改名はこのPRでやらない。
- ポリフィル対応は廃止（同日、実機検証の結果。却下欄参照）。
- Tooltipにも`align`を追加（同日。採用欄参照）。
- anchor配置のCSS変数は`--_side`/`--_span`と候補変数`--_spanStart`/`--_spanEnd`/`--_placeStart`/`--_placeEnd`で組み、`data-side`×`data-align`の組み合わせルールは持たない。`span`の語は維持し、`data-position`への統合は却下（同日。共通方針4・採用欄・却下欄参照）。
- Tooltipのディレイ既定値（入場`0.4s`・退場猶予`0.15s`）は実機で目視調整する前提の初期値。

### 実装中に実機で確認すること（未確認）

- Popoverのポップアップ（トップレイヤー）に`anchor-scope`が効くこと。効かない場合はPopoverだけ`anchor-name`をコンポーネントごとの固定名にせず、実装時に代替案（`position-anchor`を`popovertarget`の暗黙アンカーに任せる等）を検討する。
- 共通方針4の対応表どおりに揃うこと。特に`bottom span-x-end`＋`justify-self: start`が「トリガーの先頭側揃え」になり、`dir="rtl"`で左右が入れ替わること。`flip-inline`で`justify-self`も反転すること。
- `inline-start`/`inline-end`・`span-x-*`・`span-block-*`の論理キーワードがSafari 26・Firefox 147で通ること（MDNの構文には載っているが実機は未確認）。
- 非対応ブラウザでの確認手段: Firefox ESR 140（Anchor Positioning未搭載）を使う。Chromeの`--disable-blink-features=CSSAnchorPositioning`でも代替できる可能性があるが、現行Chromeで有効かは未確認。
- `@starting-style`・`transition-behavior: allow-discrete`・`position-area`等がSass（`@use`の素通し）とcssnanoで壊れないこと。
- `popovertarget`ボタンの`aria-expanded`自動公開（Chrome/Safari/Firefoxのアクセシビリティツリーで確認）。

### 事前準備

- なし（依存追加は不要）。

## 対象外・受容済みリスク

- 縦書き（`writing-mode: vertical-*`）での配置。`inline-*`と`align`は横書きのLTR/RTLだけを想定する（`left`/`right`は物理方向のまま）。
- `position-visibility`（アンカーが画面外に出た時に隠す）。
- `Modal.OpenBtn`/`CloseBtn`の改名（別Issue）。
- Accordionの既存ID優先順の食い違い（React=Context優先、Astro=子の明示ID優先）はこのPRで直さない（別Issue候補）。
- Chrome 125〜130はフォールバック表示（anchor配置なし）。自動更新でほぼ残存しないため受容。anchor配置側を`@supports`で囲う（共通方針1）ので、部分対応でも配置は崩れない。
- 同一documentに`.b--tooltip`が1つもなくなってもTooltipのdocumentリスナーは残る（永続シングルトン）。対象がなければ各ハンドラは何もしないので害はない。
- Tooltipの`:focus-visible`表示は隣接/一般兄弟結合子で実現するため、Popupは同じRoot直下に置く前提。
- Tooltipのポップアップ（`position: fixed`）は、祖先に`container-type`（`is--container`）・`transform`・`contain`等があるとその要素が包含ブロックになり、反転判定がその要素の端を基準になる。小さな要素の中では指定と逆側に出ることがある。通常のWebコンテンツでそこまで小さなcontainerは稀なので受容し、docsの`side`の注記に書く。docsのプレビュー枠（`.c--preview_inner`は`container-type`あり）はTooltipのプレビューだけ`py="50"`で余白を確保する（2026-09-02）。
- React 18でのdev時の`popoverTarget`未知prop警告。

## 完了条件 / テスト方針

- `nr lint` / `nr typecheck`（`astro check`含む）/ `nr test` / `nr build`が通る。
- 実機（Chrome・Safari 26・Firefox 147以上）:
  - 各`side`×`align`で意図した位置に出る。`dir="rtl"`のページで`side`の`start`/`end`と`align`の`start`/`end`が左右反転する。viewport端で反転する。スクロールに追従する。同一ページに複数設置しても互いのアンカーを取り違えない。
  - Tooltip: ホバー→ディレイ後表示、ポップアップへポインタ移動しても消えない、Escで消えて離れて戻ると再表示、Tabフォーカスで表示。
  - Popover: 外側クリック/Escで閉じる、閉じた時にトリガーへフォーカスが戻る、`aria-expanded`が切り替わる。
- 実機（Firefox ESR 140）: Tooltipは絶対配置で表示され機能する（`inline-*`も論理insetで正しい側に出る）。Popoverは中央カードで開閉・dismissが動く。
- 部分対応の再現確認（anchor対応ブラウザでフォールバックを強制する）: 現行ChromeのDevToolsで`@supports`の条件を書き換え（肯定側を恒偽、`not`側を恒真にする）、Tooltip Popup / Popover Popupのcomputed styleを確認する。
  - `position-area`・`position-try-fallbacks`・`position-anchor`・`justify-self` / `align-self`が初期値、`position`とinsetがフォールバックの値になる。
  - 複数設置しても互いのアンカーに引きずられない。
  - `@puppeteer/browsers`等でChrome for Testingの130系（`anchor-scope`未対応）を取得できれば、そちらでも同じ確認をする。取得できなければDevTools確認のみで可。
- `prefers-reduced-motion`でアニメーションが止まる。
- docs ja/enが表示され、サイドバーに2ページが載る。MCPの`docs-index.test.ts`が通る。
