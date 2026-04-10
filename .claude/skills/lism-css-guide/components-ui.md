# UI コンポーネント（`@lism-css/ui`）

`@lism-css/ui` パッケージには、Lism CSS の上に構築されたインタラクティブな UI コンポーネントが含まれます。

```jsx
// React
import { Accordion, Tabs, Modal, Button } from '@lism-css/ui/react';

// Astro
import { Accordion, Tabs, Modal, Button } from '@lism-css/ui/astro';
```

## TOC

- [Accordion](#accordion)
- [Alert](#alert)
- [Avatar](#avatar)
- [Badge](#badge)
- [Button](#button)
- [Callout](#callout)
- [Chat](#chat)
- [Details](#details)
- [Modal](#modal)
- [NavMenu](#navmenu)
- [Tabs](#tabs)
- [ShapeDivider](#shapedivider)
- [DummyText](#dummytext)
- [DummyImage](#dummyimage)
- [CLI でプロジェクトにコピーして使う](#cli-でプロジェクトにコピーして使う)

[詳細](https://lism-css.com/docs/components/)

---

## Accordion

ソース: [Accordion/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Accordion)

アコーディオン UI。クリックでコンテンツの開閉を切り替える。JSで開閉アニメーションを制御。パネルに `hidden='until-found'` を使用しブラウザのページ内検索に対応。

**構造:** `Accordion.Root > Accordion.Item > (Accordion.Heading > Accordion.Button) + Accordion.Panel`（`Accordion.Icon` は自動で含まれる）

| Prop | 対象 | 型 | デフォルト | 説明 |
|------|------|-----|----------|------|
| `allowMultiple` | Root | `boolean` | — | 複数アイテムの同時展開を許可 |
| `as` | Heading | `string` | `div` | 見出しのHTMLタグ。`div` 時は `role='heading'` が自動付与。`h2`〜`h6` 指定時は role なし |
| `flow` | Panel | `string` | — | パネル内コンテンツ領域（`c--accordion_content`）のフロー余白 |

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

短めの文言を目立たせて強調表示するアラートボックス。`type` プリセットによりアイコンとカラーが自動設定される。

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `type` | `'alert' \| 'point' \| 'warning' \| 'check' \| 'help' \| 'info'` | `'alert'` | アラートタイプ。keycolor と icon の組み合わせプリセット |
| `keycolor` | `string` | — | キーカラー |
| `icon` | `ReactNode \| string` | — | カスタムアイコン |
| `layout` | `'flex' \| 'sideMain'` | `'flex'` | レイアウトモジュール |
| `flow` | `string` | `'s'` | コンテンツを囲む要素のフロー余白 |

```jsx
<Alert type='warning'>Warning message</Alert>
```


## Avatar

ソース: [Avatar/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Avatar)

アバター（プロフィール画像）コンポーネント。Frame ベースの円形画像表示。`c--avatar` クラスが付与される。

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `src` | `string` | — | 画像URL |
| `alt` | `string` | — | 代替テキスト |
| `size` | `string` | `'1.5em'` | アバターのサイズ |

```jsx
<Avatar src='/avatar.jpg' alt='User' size='48px' />
```


## Badge

ソース: [Badge/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Badge)

バッジ（ラベル）コンポーネント。`span` 要素としてインライン表示。`c--badge` クラスが付与される。

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `variant` | `string` | — | バリエーション（`'outline'` 等）。`c--badge--{variant}` クラスが出力 |
| `keycolor` | `string` | — | キーカラー |

```jsx
<Badge keycolor='green'>New</Badge>
```


## Button

ソース: [Button/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Button)

ボタン型リンクコンポーネント。デフォルトで `a` 要素として出力。`c--button` クラスが付与される。

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `variant` | `string` | — | バリエーション（`'fill'`, `'outline'` 等）。`c--button--{variant}` クラスが出力 |
| `keycolor` | `string` | — | キーカラー |
| `href` | `string` | — | リンク先URL |

```jsx
<Button variant='fill' href='#'>Click me</Button>
```


## Callout

ソース: [Callout/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Callout)

記事中の重要ポイントを示すコンポーネント。タイトルとアイコン付きの強調ボックス。`type` プリセットによりアイコンとカラーが自動設定される。

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `type` | `'note' \| 'alert' \| 'point' \| 'warning' \| 'check' \| 'help'` | `'note'` | コールアウトタイプ |
| `keycolor` | `string` | — | キーカラー |
| `icon` | `ReactNode \| string` | — | カスタムアイコン |
| `title` | `string` | — | タイトルテキスト |
| `flow` | `string` | `'s'` | コンテンツ部分のフロー余白 |

```jsx
<Callout type='note' title='Important' keycolor='blue'>Important note</Callout>
```


## Chat

ソース: [Chat/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Chat)

チャット風の吹き出しコンポーネント。Grid ベースの会話形式 UI。`c--chat` クラスが付与される。

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `name` | `string` | — | 発言者の名前 |
| `avatar` | `string` | — | アバター画像の src |
| `variant` | `'speak' \| 'think'` | `'speak'` | チャットタイプ |
| `direction` | `'start' \| 'end'` | `'start'` | 表示位置 |
| `keycolor` | `string` | `'gray'` | キーカラー |
| `flow` | `string` | `'s'` | コンテンツ要素のフロー余白 |

```jsx
<Chat name='Alice' avatar='/alice.jpg'>Hello!</Chat>
```


## Details

ソース: [Details/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Details)

HTML の `details/summary` 要素をラップしたコンポーネント。Accordion とは違い JS を使わず CSS のみで実装。

**構造:** `Details.Root > Details.Summary > (Details.Title + Details.Icon) + Details.Content`

| Prop | 対象 | 型 | デフォルト | 説明 |
|------|------|-----|----------|------|
| `as` | Title | `string` | `'span'` | Title の HTML タグ |
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
|------|------|-----|----------|------|
| `id` | Root | `string` | — | モーダルの ID（必須） |
| `modalId` | OpenBtn / CloseBtn | `string` | — | 対象モーダルの ID |
| `duration` | Root | `string` | — | アニメーション持続時間。`--duration` 変数として出力 |
| `offset` | Inner | `string` | — | 非表示時の位置オフセット。`--offset` 変数として出力 |
| `layout` | Inner | `string` | — | Inner 要素のレイアウトモジュール |

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

ナビゲーションメニューコンポーネント。`c--navMenu` クラスが付与される。

**構造:** `NavMenu.Root > NavMenu.Item > NavMenu.Link`（`NavMenu.Nest` でネスト可能）

| Prop | 対象 | 型 | デフォルト | 説明 |
|------|------|-----|----------|------|
| `hovBgc` | Root | `string` | — | ホバー時の背景カラー。`--hov-bgc` 変数として出力 |
| `hovC` | Root | `string` | — | ホバー時のテキストカラー。`--hov-c` 変数として出力 |
| `itemP` | Root | `string` | — | 各アイテムのパディング。`--_item-p` 変数として出力 |
| `href` | Link | `string` | — | リンク先URL。指定ありで `a` 要素、なしで `span` 要素 |

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


## Tabs

ソース: [Tabs/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/Tabs)

タブ切り替え UI。タブクリックでコンテンツパネルを切り替える。スタイリングはほぼなく動きのみ提供。

**構造:** `Tabs.Root > Tabs.Item > (Tabs.Tab + Tabs.Panel)`（`Tabs.List` も利用可能）

| Prop | 対象 | 型 | デフォルト | 説明 |
|------|------|-----|----------|------|
| `tabId` | Root | `string` | — | タブを特定するための ID 文字列 |
| `defaultIndex` | Root | `number` | `1` | 初期アクティブタブ（1始まり） |
| `listProps` | Root | `object` | — | タブボタンリスト要素へ渡す props |

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


## ShapeDivider

ソース: [ShapeDivider/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/ShapeDivider)

セクション間の波型などの装飾的な区切り要素。SVG ベースの形状で区切りを表現。

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `viewBox` | `string` | — | SVG の viewBox |
| `level` | `number` | `5` | シェイプの高さレベル。`0` で非表示 |
| `flip` | `'X' \| 'Y' \| 'XY'` | — | 反転方向。`data-flip` 属性として出力 |
| `stretch` | `string` | — | 水平方向の引き伸ばし量。`--_inner-stretch` 変数として出力 |
| `offset` | `string` | — | 水平方向のオフセット。`--_inner-offset` 変数として出力 |
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
|------|-----|----------|------|
| `lang` | `'ja' \| 'en' \| 'ar'` | `'en'` | テキストの言語 |
| `length` | `'xs' \| 's' \| 'm' \| 'l' \| 'xl' \| 'codes'` | `'m'` | テキストの長さ。`'codes'` は `b`, `i`, `a`, `code` 要素を含むテキスト |
| `pre` | `string` | — | テキストの前に表示する文字列 |
| `offset` | `number` | `0` | テキストのオフセット。区切り文字単位で先頭を切り捨て |

```jsx
<DummyText lang='ja' />
```


## DummyImage

ソース: [DummyImage/](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components/DummyImage)

ダミーのプレースホルダー画像を出力するコンポーネント。`cdn.lism-css.com` からダミー画像を取得。

```jsx
<DummyImage />
```


## CLI でプロジェクトにコピーして使う

`@lism-css/ui` の UI コンポーネントは、CLI コマンドで自分のプロジェクトにソースコードをコピーして使うこともできます。コピーしたファイルは自由にカスタマイズ可能です。

```bash
# 初期設定（framework、出力先ディレクトリを対話的に設定）
npx lism-ui init

# コンポーネントを追加
npx lism-ui add Button Modal
npx lism-ui add -a          # 全コンポーネントを追加

# 利用可能なコンポーネント一覧を表示
npx lism-ui list
```

`init` で生成される `lism-ui.json`:

```json
{
  "framework": "react",
  "componentsDir": "src/components/ui",
  "helperDir": "src/components/ui/_helper"
}
```
