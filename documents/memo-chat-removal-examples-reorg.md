# メモ: Chatのuiパッケージ削除検討と ui/examples・Patterns 再編案

> 作成日: 2026-08-14 / 最終更新: 2026-08-15（方針確定） / #550のChat移行作業（`34af1576`）中の議論から。

## 現時点のステータス

- **方針は確定済み。確定内容はissue #557のコメントが正**（このメモの論点3は検討過程の案であり、確定方針では Patterns/Parts 新設ではなく ui/ 内の3分類「Blocks / Block Examples / Components」に変更された）。
- Chatの`@lism-css/ui`からの削除とdocs作例化（`/ui/block-examples/chat/`）はPR①で実施済み。残りの再編（3分類の完成・Timeline/Table/Listのb--化など）はPR②で対応する。

## 論点1: Chatを`@lism-css/ui`パッケージから削除するか

削除に傾いている。理由:

- **パッケージ内で立ち位置が浮いている**。Badge/Alert/Calloutのような汎用UI語彙でもなく、Accordion/Modal/TabsのようなJS付きインタラクティブUIでもない。実体はGrid + Frame + Flow + Decorator + cboxの組み合わせ＋少しのCSSで、「Lismのprimitivesでこう組める」という作例そのもの。
- **APIの要求が発散しやすい**（時刻・既読・footer等。Chat.astroに`footer` slotのコメントアウト痕跡あり）。作例なら利用者が自由に拡張できる。
- **移行が無傷**: docs作例のCSSをコピーすればマークアップ変更ゼロで同じ見た目（下記の「b--のまま紹介」方針のため）。
- 対比基準: 同じ非インタラクティブでもShapeDividerはSVGパス生成ロジックがあり手書き再現が難しい→コンポーネントの価値あり。**「手で書けない仕組みを持つか」が線引き**。

### 削除時の注意（要判断）

- コンポーネント削除は**破壊的変更**。b--リネームの破壊的リリース（v0.26.0想定）に同乗させられれば傷が最小。それを逃すと次の破壊的リリース待ちになる。
- リポジトリ内のChat使用箇所は docsのChatページ自身＋docs `_theme.scss`のダークモード上書き（`.b--chat { --cbox-bgPct: 16% }`）のみ。templatesは未使用（2026-08-14時点確認済み）。

### 削除する場合の追随箇所

- `packages/lism-ui/src/components/Chat/`一式・`src/style.scss`のimport
- `package.json` exports / `registry-index.json`（ビルドで自動再生成）
- docs ja/en `ui/Chat.mdx`（→作例ページへ転換。Previewはパッケージimport不可になるためprimitives直組みへ書き換え。HTMLタブが土台になる）
- docs `_theme.scss`の`.b--chat`上書き（作例化後も有効だが位置づけ確認）
- skills `lism-css-guide/components-ui.md`のChatセクション
- MCP `docs-index.json`
- リリースノートに削除と移行方法（CSSコピー先: `@layer lism-block`）を明記

## 論点2: Chatの紹介方法 — **b--のままui/examples系で紹介する**（方針ほぼ確定）

- `b--`の契約は「ベーススタイルをCSS管理する基礎部品」であり、パッケージ提供物専用の印ではない。利用者のプロジェクトにも`lism-block`レイヤーはある（コアでは空）。コピーしたCSSを`lism-block`へ置き、`lism-custom`で上書きする運用はアーキテクチャそのまま。
- ブログのふきだしのように「サイト全体で繰り返し使う部品」はb--の性格（ユーザー判断: chatを使うケースはb--になる）。
- Props→CSS移行済みの`_style.css`（`34af1576`）がそのまま掲載用CSSになる。

## 論点3: ui/examples・Patterns の再編案

現状の`ui/examples/`は14ページで、`c--`使用ページ（FAQ・List・Table・Timeline・BalloonBox・Others）とprimitivesだけのページ（Breadcrumb・Hero・Steps・Reel・Banner・Card・Decorations・DividerLabel）が混在。

### 振り分け基準（案）

| 置き場所 | 基準 | 該当（案） |
| --- | --- | --- |
| Patterns（新設） | primitives＋Property Classの組み合わせでほぼ組める。CSSは不要〜僅か。案件ごとに書き換える構成例 | breadcrumb / hero / steps / reel / faq など |
| ui/examples（b--部品カタログ化） | まとまった独自CSSを持ち、部品として運用する。CSSは`lism-block`にコピーして使う | chat / timeline |

- **Patterns > Parts** セクションを用意し、単一コンポーネントっぽいパーツパターンも掲載する（ユーザー案）。
- timelineは「chatっぽくてCSSが結構いる」ため、基準に従えばb--側（`c--timeline`→`b--timeline`へ改名して紹介）。
- List / Table あたりはCSS量次第のグレーゾーン。再編時に個別判断。
- `c--balloonBox`はChatと役割が被るため統合候補。

## 参照

- 発端: #550（b--/lism-block移行）。経緯は`documents/handover-550-ui-b-prefix.md`。
- b--/c--規約の大元: #545。
