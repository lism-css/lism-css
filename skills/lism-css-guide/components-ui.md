# UI コンポーネント（`@lism-css/ui`）

`@lism-css/ui` パッケージには、Lism CSS の上に構築されたインタラクティブな UI コンポーネントが含まれます。

import は **コンポーネント単位の deep path** （`@lism-css/ui/{react,astro}/<Component>`）から行うこと。`@lism-css/ui/react` / `@lism-css/ui/astro` からの一括 import は使わない。

```jsx
// React
import { Accordion } from '@lism-css/ui/react/Accordion';
import { Tabs } from '@lism-css/ui/react/Tabs';
import { Modal } from '@lism-css/ui/react/Modal';
import { Button } from '@lism-css/ui/react/Button';

// Astro
import { Accordion } from '@lism-css/ui/astro/Accordion';
import { Tabs } from '@lism-css/ui/astro/Tabs';
import { Modal } from '@lism-css/ui/astro/Modal';
import { Button } from '@lism-css/ui/astro/Button';
```

## TOC

- [Accordion](#accordion)
- [Alert](#alert)
- [Avatar](#avatar)
- [Badge](#badge)
- [Button](#button)
- [Callout](#callout)
- [Details](#details)
- [Modal](#modal)
- [NavMenu](#navmenu)
- [Popover](#popover)
- [Tabs](#tabs)
- [Tooltip](#tooltip)
- [ShapeDivider](#shapedivider)
- [DummyText](#dummytext)
- [CLI でプロジェクトにコピーして使う](#cli-でプロジェクトにコピーして使う)

[詳細](https://lism-css.com/ui.md)

---

## Accordion

ソース: [Accordion/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Accordion)

アコーディオン UI。クリックでコンテンツの開閉を切り替える。JSで開閉アニメーションを制御。パネルに `hidden='until-found'` を使用しブラウザのページ内検索に対応。

**構造:** `Accordion.Root > Accordion.Item > (Accordion.Heading > Accordion.Button) + Accordion.Panel`（`Accordion.Icon` は自動で含まれる）

| Prop | 対象 | 型 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `allowMultiple` | Root | `boolean` | — | 複数アイテムの同時展開を許可 |
| `isOpen` | Item / Button / Panel | `boolean` | `false` | アイテムを初期展開。Item・Button・Panel の3つ揃えて指定（Item=`data-opened` 付与、Button=`aria-expanded`、Panel=`hidden` 解除） |
| `as` | Heading | `string` | `div` | 見出しのHTMLタグ。`div` 時は `role='heading'` が自動付与。`h2`〜`h6` 指定時は role なし |
| `flow` | Panel | `string` | — | パネル内コンテンツ領域（`b--accordion_content`）のフロー余白 |

```jsx
<Accordion.Root>
  <Accordion.Item>
    <Accordion.Heading>
      <Accordion.Button>Label</Accordion.Button>
    </Accordion.Heading>
    <Accordion.Panel>Content</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
```


## Alert

ソース: [Alert/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Alert)

短めの文言を目立たせて強調表示するアラートボックス。`type` プリセットによりアイコンとカラーが自動設定される。`b--alert` クラスが付与される。
プリセット: `alert`=alert/red, `point`=lightbulb/orange（`tip`も同じ）, `warning`=warning/yellow, `check`=check-circle/green, `help`=question/purple, `info`=info/blue, `note`=note/gray。

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `type` | `'alert' \| 'point' \| 'tip' \| 'warning' \| 'check' \| 'help' \| 'info' \| 'note'` | `'alert'` | アラートタイプ。keycolor と icon の組み合わせプリセット |
| `keycolor` | `string` | — | キーカラー |
| `icon` | `ReactNode \| string` | — | カスタムアイコン |
| `layout` | `'flex' \| 'withSide'` | `'flex'` | レイアウトプリミティブ |
| `flow` | `string` | `'s'` | コンテンツを囲む要素のフロー余白 |

```jsx
<Alert type='warning'>Warning message</Alert>
```


## Avatar

ソース: [Avatar/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Avatar)

アバター（プロフィール画像）コンポーネント。円形の画像表示で、`b--avatar` クラスが付与される。`src` ありは `l--frame`、`src` 未指定時は `l--center` に切り替わり、ルートに `b--avatar--initial`（背景色 `--base-2`）が付いて `name` の先頭1文字をイニシャルとして `span` で表示する（画像ロード失敗時の自動切替は無い）。

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `src` | `string` | — | 画像URL。未指定なら `name` のイニシャルを表示 |
| `name` | `string` | — | ユーザー名。イニシャルの生成元。`alt` 未指定時は代替テキストにも使う |
| `alt` | `string` | — | 代替テキスト。指定時は `name` より優先。`alt=''` で装飾扱い（イニシャル表示時は `aria-hidden`） |
| `size` | `string` | `'2em'` | アバターのサイズ |

```jsx
<Avatar src='/avatar.jpg' alt='User' size='48px' />
<Avatar name='Yamada Taro' size='48px' /> {/* イニシャル "Y" を表示 */}
<Avatar name='Yamada Taro' bgc='brand' c='base' /> {/* 背景色はルートの Prop で上書き可 */}
```


## Badge

ソース: [Badge/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Badge)

バッジ（ラベル）コンポーネント。`span` 要素としてインライン表示。`b--badge` クラスが付与される。

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `variant` | `string` | — | バリエーション（`'outline'` 等）。`b--badge--{variant}` クラスが出力 |
| `keycolor` | `string` | — | キーカラー |

```jsx
<Badge keycolor='green'>New</Badge>
```


## Button

ソース: [Button/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Button)

ボタン型リンクコンポーネント。デフォルトで `a` 要素として出力。`b--button` クラスが付与される。

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `variant` | `string` | — | バリエーション（`'fill'`, `'outline'` 等）。`b--button--{variant}` クラスが出力 |
| `keycolor` | `string` | — | キーカラー |
| `href` | `string` | — | リンク先URL |

```jsx
<Button variant='fill' href='#'>Click me</Button>
```


## Callout

ソース: [Callout/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Callout)

記事中の重要ポイントを示すコンポーネント。タイトルとアイコン付きの強調ボックス。`type` プリセットによりアイコンとカラーが自動設定される（プリセット内容は [Alert](#alert) と同一）。`b--callout` クラスが付与される。

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `type` | `'alert' \| 'point' \| 'tip' \| 'warning' \| 'check' \| 'help' \| 'info' \| 'note'` | `'note'` | コールアウトタイプ |
| `keycolor` | `string` | — | キーカラー |
| `icon` | `ReactNode \| string` | — | カスタムアイコン |
| `title` | `string` | — | タイトルテキスト |
| `flow` | `string` | `'s'` | コンテンツ部分のフロー余白 |

```jsx
<Callout type='note' title='Note'>Supplemental note</Callout>
```


## Details

ソース: [Details/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Details)

HTML の `details/summary` 要素をラップしたコンポーネント。Accordion とは違い JS を使わず CSS のみで実装。

**構造:** `Details.Root > Details.Summary > (Details.Title + Details.Icon) + Details.Content`

| Prop | 対象 | 型 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `as` | Title | `string` | `'span'` | Title の HTML タグ |
| `open` | Root | `boolean` | — | 初期展開状態（`details` 要素の `open` 属性） |
| `--duration` | Root | `string` | — | 展開アニメーションの秒数（style 経由で指定） |

```jsx
<Details.Root>
  <Details.Summary>
    <Details.Title>Title</Details.Title>
    <Details.Icon />
  </Details.Summary>
  <Details.Content>Content</Details.Content>
</Details.Root>
```


## Modal

ソース: [Modal/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Modal)

モーダルダイアログ UI。`dialog` 要素を使用。`data-modal-open` / `data-modal-close` 属性で開閉を制御。

**構造:** `Modal.OpenBtn + Modal.Root > Modal.Inner > Modal.Body + Modal.CloseBtn`

| Prop | 対象 | 型 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | Root | `string` | — | モーダルの ID（必須） |
| `modalId` | OpenBtn / CloseBtn | `string` | — | 対象モーダルの ID |
| `duration` | Root | `string` | — | アニメーション持続時間。`--duration` 変数として出力 |
| `offset` | Inner | `string` | — | 非表示時の位置オフセット。`--offset` 変数として出力 |
| `layout` | Inner | `string` | — | Inner 要素のレイアウトプリミティブ |

```jsx
<Modal.OpenBtn modalId='modal-01'>Open</Modal.OpenBtn>
<Modal.Root id='modal-01'>
  <Modal.Inner>
    <Modal.Body>Content</Modal.Body>
    <Modal.CloseBtn modalId='modal-01' />
  </Modal.Inner>
</Modal.Root>
```


## NavMenu

ソース: [NavMenu/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/NavMenu)

ナビゲーションメニューコンポーネント。`b--navMenu` クラスが付与される。

**構造:** `NavMenu.Root > NavMenu.Item > NavMenu.Link`（`NavMenu.Nest` でネスト可能）

| Prop | 対象 | 型 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `hovBgc` | Root | `string` | — | ホバー時の背景カラー。`--hov-bgc` 変数として出力 |
| `hovC` | Root | `string` | — | ホバー時のテキストカラー。`--hov-c` 変数として出力 |
| `itemP` | Root | `string` | — | 各アイテムのパディング。`--item-p` 変数として出力 |
| `href` | Link | `string` | — | リンク先URL（Link は常に `a` 要素として出力） |
| `hov` | Link | `string` | `-bgc` | ホバー時のスタイル。デフォルトで背景色が変化 |

```jsx
<NavMenu.Root>
  <NavMenu.Item>
    <NavMenu.Link href='/'>Home</NavMenu.Link>
  </NavMenu.Item>
  <NavMenu.Item>
    <NavMenu.Link href='/about'>About</NavMenu.Link>
  </NavMenu.Item>
</NavMenu.Root>
```


## Popover

ソース: [Popover/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Popover)

クリックで開くインタラクティブなパネル。ネイティブ Popover API（`popover` 属性）で開閉し、CSS Anchor Positioning でトリガーの隣に配置する。クライアント JS なし。開閉・外側クリック/Esc での light dismiss・フォーカス復帰・`aria-expanded` はブラウザに任せる。Anchor Positioning 非対応ブラウザでは画面中央のカードとして開く。ホバーで出す補足テキストは `Tooltip` を使う。

**構造:** `Popover.Root > Popover.Trigger + Popover.Popup > (Content + Popover.Close)`

| Prop | 対象 | 型 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `popoverId` | Root | `string` | 自動生成 | Trigger の `popovertarget`・Popup の `id`・Close の `popovertarget` に配布する ID。Root 配下では子に ID を指定しない |
| `popoverId` | Trigger / Close | `string` | — | Root 外で単体利用するときだけ指定（Popup の `id` と揃える） |
| `offset` | Root | `string` | `var(--s5)` | トリガーとの距離。`--popover-offset` 変数として出力 |
| `side` | Popup | `'top' \| 'bottom' \| 'start' \| 'end'` | `'bottom'` | 表示位置。`data-side` として出力。`start`/`end` は横方向で、書字方向に追従する inline 軸の論理方向（LTR では `start`=左）。viewport 端で自動反転 |
| `align` | Popup | `'start' \| 'center' \| 'end'` | `'center'` | トリガーに対する揃え。`data-align` として出力。`side` が `top`/`bottom` のとき書字方向、横方向のとき `start`=上・`end`=下 |
| `type` | Popup | `'auto' \| 'manual'` | `'auto'` | `popover` 属性の値。`manual` は light dismiss と Esc が無効になるので `Close` を必ず置く |
| `icon` / `srText` | Close | `string` | `'x'` / `'Close'` | 子要素が無いときのアイコンとスクリーンリーダー向けテキスト |

- CSS 変数（`--popover-offset`・`--popover-duration`）は Root（`.b--popover`）で受け取る。Root かその祖先に指定する。Popup に書いても効かない。
- Trigger / Close は `button` 要素でなければ `popovertarget` が効かない。
- 色・余白・角丸・影は Lism props（`bgc`・`p`・`bdrs`・`bxsh` 等）で上書きする。開閉フェードの時間は `--popover-duration`。
- フォームを含む場合は Popup に `role='dialog'` と `aria-label` を付ける。

```jsx
<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Popup side='bottom' align='start'>
    Content
    <Popover.Close srText='閉じる' />
  </Popover.Popup>
</Popover.Root>
```


## Tabs

ソース: [Tabs/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Tabs)

タブ切り替え UI。タブクリックまたは左右キー・Home/End でコンテンツパネルを切り替える。縦並びにする場合は `listProps` で `aria-orientation="vertical"` を指定すると上下キーに切り替わる。スタイリングはほぼなく動きのみ提供。

**構造:** `Tabs.Root > Tabs.Item > (Tabs.Tab + Tabs.Panel)`（`Tabs.List` も利用可能）

| Prop | 対象 | 型 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `tabId` | Root | `string` | — | タブを特定するための ID 文字列 |
| `defaultIndex` | Root | `number` | `1` | 初期アクティブタブ（1始まり） |
| `listProps` | Root | `object` | — | タブボタンリスト要素へ渡す props |
| `variant` | Root | `string` | `'default'` | バリエーション。`b--tabs--{variant}` クラスが出力。`'default'` のほか `'line'` を標準提供。独自 variant 指定時は既定バリアント（`b--tabs--default`）の装飾が適用されない |

```jsx
<Tabs.Root>
  <Tabs.Item>
    <Tabs.Tab>Tab 1</Tabs.Tab>
    <Tabs.Panel>Content 1</Tabs.Panel>
  </Tabs.Item>
  <Tabs.Item>
    <Tabs.Tab>Tab 2</Tabs.Tab>
    <Tabs.Panel>Content 2</Tabs.Panel>
  </Tabs.Item>
</Tabs.Root>
```


## Tooltip

ソース: [Tooltip/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Tooltip)

ホバー / キーボードフォーカスで出る補足テキスト。表示制御は CSS のみで、JS は「Esc で閉じる」だけ（`scripts/tooltip.js`）。CSS Anchor Positioning でトリガーの隣に配置し、非対応ブラウザではトリガー基準の絶対配置にフォールバックする。中にリンク・ボタンを置かない（それは `Popover`）。重要な情報をツールチップだけに入れない（タッチでは見えない）。

**構造:** `Tooltip.Root > Tooltip.Trigger + Tooltip.Popup`（Popup は Root 直下に置く）

| Prop | 対象 | 型 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `tooltipId` | Root | `string` | 自動生成 | Trigger の `aria-describedby` と Popup の `id` に配布する ID。Root 配下では子に ID を指定しない |
| `tooltipId` | Trigger | `string` | — | Root 外で単体利用するときだけ指定（Popup の `id` と揃える） |
| `delay` | Root | `string` | `0.4s` | 表示までのディレイ。`--tooltip-delay` 変数として出力（退場猶予は `--tooltip-delay--close`、既定 `0.15s`） |
| `offset` | Root | `string` | `var(--s5)` | トリガーとの距離。`--tooltip-offset` 変数として出力 |
| `side` | Popup | `'top' \| 'bottom' \| 'start' \| 'end'` | `'top'` | 表示位置。`data-side` として出力。`start`/`end` は横方向で、書字方向に追従する inline 軸の論理方向（LTR では `start`=左）。viewport 端で自動反転 |
| `align` | Popup | `'start' \| 'center' \| 'end'` | `'center'` | `side` と直交する方向の揃え。`data-align` として出力。`side` が `top`/`bottom` のとき `start`/`end` は書字方向に追従 |

- CSS 変数（`--tooltip-offset`・`--tooltip-delay`・`--tooltip-delay--close`・`--tooltip-duration`）は Root（`.b--tooltip`）で受け取る。Root かその祖先に指定する。Popup に書いても効かない。
- Trigger の既定は `button`。`as='span'` 等にするなら `tabindex='0'` でフォーカス可能にする。
- 既定は反転配色（`--text` 背景・`--base` 文字）。色・余白・角丸は Lism props（`bgc`・`c`・`p`・`bdrs` 等）で上書きする。フェード時間は `--tooltip-duration`。

```jsx
<Tooltip.Root>
  <Tooltip.Trigger>Save</Tooltip.Trigger>
  <Tooltip.Popup side='top'>Shortcut: ⌘S</Tooltip.Popup>
</Tooltip.Root>
```


## ShapeDivider

ソース: [ShapeDivider/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/ShapeDivider)

セクション間の波型などの装飾的な区切り要素。SVG ベースの形状で区切りを表現。

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `viewBox` | `string` | — | SVG の viewBox |
| `level` | `number` | `5` | シェイプの高さレベル。`0` で非表示 |
| `flip` | `'X' \| 'Y' \| 'XY'` | — | 反転方向。`data-flip` 属性として出力 |
| `stretch` | `string` | — | 水平方向の引き伸ばし量。`--inner-stretch` 変数として出力 |
| `offset` | `string` | — | 水平方向のオフセット。`--inner-offset` 変数として出力 |
| `isEmpty` | `boolean` | — | シェイプを非表示にしてスペーサーとして使用 |
| `isAnimation` | `boolean` | — | アニメーションを有効化。`data-has-animation` 属性として出力 |

```jsx
<ShapeDivider viewBox='0 0 100 10'>
  <path d='M100 6C89.3 3.3 82.7 9 70 9S48.4 3 38 3 24.5 6 17 6C7.4 6 0 0 0 0v10h100V6z'/>
</ShapeDivider>
```


## DummyText

ソース: [DummyText/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/DummyText)

ダミーテキストを生成するコンポーネント。プレビューやテスト用。複数の言語とテキスト長に対応。

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `lang` | `'ja' \| 'en' \| 'ar'` | `'en'` | テキストの言語 |
| `length` | `'xs' \| 's' \| 'm' \| 'l' \| 'xl' \| 'codes'` | `'m'` | テキストの長さ。`'codes'` は `b`, `i`, `a`, `code` 要素を含むテキスト |
| `pre` | `string` | — | テキストの前に表示する文字列 |
| `offset` | `number` | `0` | テキストのオフセット。区切り文字単位で先頭を切り捨て |

```jsx
<DummyText lang='ja' />
```


## CLI でプロジェクトにコピーして使う

`@lism-css/ui` の UI コンポーネントは、CLI コマンドで自分のプロジェクトにソースコードをコピーして使うこともできます。コピーしたファイルは自由にカスタマイズ可能です。

コンポーネント名は `import` するときと同じ PascalCase で指定します。

```bash
# 初期設定（lism.config.js が無い場合に新規生成。framework 等を対話的に設定）
npx lism-cli init

# コンポーネントを追加
npx lism-cli ui add Button Modal
npx lism-cli ui add NavMenu
npx lism-cli ui add --all        # 全コンポーネントを追加

# 利用可能なコンポーネント一覧を表示
npx lism-cli ui list
```

`init` で生成される `lism.config.js` の `ui` セクション:

```js
export default {
  ui: {
    framework: 'react',
    dir: 'src/components/ui', // helper は常に {dir}/_helper に配置される
  },
};
```
