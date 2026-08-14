# Issue #550 作業引き継ぎ: @lism-css/ui の b--/lism-block 移行

> 作成日: 2026-08-13 / 最終更新: 2026-08-15（Modal実装・docs完了、コミット済み）/ 基準: `feature/550-ui-b-prefix` ブランチ / `@lism-css/ui` v0.25.0

## 要点

- #550のクラス移行（`c--*`→`b--*`・`@layer lism-component`→`lism-block`）とリポジトリ内の参照追随は**すべて完了し、`68b14472`までコミット済み**。
- 現在は「Props→CSS移行」を**1コンポーネントずつ**進めている。進捗は[進捗表](#進捗props→css移行)を参照。
- docsの目視確認は独立タスクではなく、各コンポーネントの移行確認フローに統合して消化する。

## 進め方（ユーザー指示。厳守）

- **1コンポーネントずつ**、「調査 → 移行案の提示 → 実装 → ユーザーが目視確認 → OK後にコミット」のサイクルで進める。
- 目視確認は**ユーザー自身が行う**。エージェントがブラウザを起動して確認する必要はない。
- devサーバーはユーザーが起動済み（localhost:4000）。エージェントが別途立ち上げない。
- **ユーザーの目視確認が終わるまでコミットしない**（コンポーネントごとに確認を待つ）。
- hover表現（`hov="-o"`等）は**propsのまま残す**（Buttonでユーザーが決定。以降も同方針の想定だが、毛色の違うhoverが出たら都度確認する）。

## 背景（なぜProps→CSS移行するか）

`b--`の契約は「ベーススタイルはCSS側で管理」だが、現状のuiコンポーネントはベーススタイルの一部をLism Props（＝Property Class、レイヤー外で最強）として出力している。このため利用者が`@layer lism-custom`に`.b--button { padding: ... }`と書いても効かない。見た目を構成する宣言をCSS（`lism-block`レイヤー）へ移すことで優先度が下がり、利用者が上書きしやすくなる。

## 1コンポーネントの作業手順（Buttonで確立したパターン）

1. react/astroコンポーネントのLism Propsと`_style.css`の現状を読む。
2. 各propが展開する実クラス・実CSS宣言を確認する。
   - props定義: `packages/lism-css/config/defaults/props.ts`（token / presets / utils等）
   - 実宣言の確認: `packages/lism-css/dist/css/main.css`をgrep（例: `.-py\:10{padding-block:var(--s10)}`）
3. 影響範囲を確認する。
   - docs / templatesの`b--*`上書きCSS（`lism-custom`レイヤーは`lism-block`より強いため、変数上書きは移行後も安全）
   - テストが出力クラスに依存していないか
4. 見た目を構成する宣言を`_style.css`の`@layer lism-block`へ移し、react/astroから該当propsを削除する（`hov`は残す）。
   - `lism-block`はtrait/primitiveより弱いレイヤーのため、primitiveの宣言（`l--stack`の`flex-direction`等）をblock側で上書きすることはできない。primitiveのデフォルトと異なる見た目にしたい場合は、primitiveクラスを使わずblock CSSが自前で宣言を持つこと（Buttonの`display: inline-flex`が前例）。
5. docsのja/en `ui/*.mdx`にあるHTMLタブのスニペットを追随する（コンポーネント出力クラスの写しのため）。「Only lism-css」等、`b--*`クラスを使わない自力構築例は対象外。
6. skills `lism-css-guide/components-ui.md`とMCP `packages/mcp/src/data/docs-index.json`への影響を確認する（Buttonではどちらも該当記載なしで修正不要だった）。
7. `nr build:ui`で`dist/style.css`への反映を確認し、ユーザーに目視確認を依頼する。コミットはOKが出てから。

## 進捗（Props→CSS移行）

| コンポーネント | 状態 | メモ |
| --- | --- | --- |
| Button | **完了・コミット済み（`3df1c81d`）** | `hl="s" py="10" px="20"`をCSSへ移行（`--hl: var(--hl--s)` / `padding-block: var(--s10)` / `padding-inline: var(--s20)`）し、`display: inline-flex`もCSSで管理。デフォルトの`l--flex`出力を廃止し`Flex`→`Link`ベースへ変更（`layout="grid"`指定時のみ`l--grid`が付く）。`hov="-o"`はpropsのまま。docs ja/en MDXのHTMLスニペット追随済み（`-hl:s -py:10 -px:20`と`l--flex`を削除） |
| Badge | **完了・コミット済み（`34c3492b`）** | `d/fz/hl/py/px/bdrs`をCSSへ移行。paddingはem基準（`0.25em 0.625em`）、デフォルトborder-radiusは**`--bdrs--99`（ピル型）へ変更**（`border-radius: var(--bdrs--99)`直書き。`bdrs` propはProperty Classがレイヤー外のため従来通り効く）。u--cbox併用調整用の`--cbox-*`変数あり。変数フックは`--bdw`/`--hl`。docs ja/enはExamples再構成（カラーパレットの活用/スタイルの調整例の見出し・HTMLタブ拡充・Overviewからu--cbox例削除・見出し「Without @lism-css/ui」へ統一）。MCP docs-indexのheadings同期済み |
| Chat | **完了・コミット済み（`34af1576`）** | Root `keycolor="gray"`（→`--keycolor: var(--gray)`）・`ji`/`jslf`（→`[data-chat-dir]`セレクタ）・Avatar `bgc/ar/bdrs`・Name `c/fs/fz/hl/py/px/aslf`・Body/Deco `pos`・Content `bdrs/p/hl`をCSSへ移行。**`flow="s"`は`.b--chat_content { --flow--base: var(--flow--s) }`の変数フックで移行**（`-flow:s`はレイヤー外クラスのためblockレイヤーへの単純移行はprimitiveの`--flow: var(--flow--base)`に負ける。`flow` propはデフォルト無しで存続）。Grid/Frame/Flowベースは維持（primitiveのデフォルトdisplayをそのまま使うため。`.l--grid > * { min-width: 0 }`も理由）。**`variant="think"`をdocsのOpt-inから`_style.css`標準スタイルへ昇格**。docs ja/enはHTMLスニペット追随＋think例をExamplesへ移動・HTMLタブ追加（ユーザー加筆分含む）。skillsの`flow`デフォルト表記修正・MCP headings同期（Opt-in削除） |
| Accordion | **完了・コミット済み（`2973a310`）** | `g/w/ai/jc/p`をCSSへ移行（`.b--accordion_button`に`display: flex`＋`padding: var(--s15)`等、`.b--accordion_content`に`padding: var(--s15)`）。Root/ButtonをLismベース化（デフォルトの`l--stack`/`l--flex`出力を廃止。レイアウトが必要なら`layout="stack"`等を指定）、Panelの`pos/ov`もCSSへ。Headingの`set--plain`はdiv以外（見出しタグ指定時）のみ出力。docs ja/enはExamples再構成（Overviewをデフォルト表示化・「スタイリング例」新設・HTMLタブ拡充）、MCP headings同期 |
| Details | **完了・コミット済み（`0f5cacfb`）** | Summary/TitleをLismベース化し、summaryのflex構成＋`padding: var(--s15)`と`.b--details_content`の`padding: var(--s15)`をCSSでデフォルト化（Accordionと同じ構成。paddingは閉時の余白残り回避のため`_body`ではなく`_content`）。Titleの`flex: 1`は`justify-content: space-between`に置換、`set--plain`はspan以外のみ出力。Contentの`flow="s"`を削除（素の`l--flow`に）。docs ja/enはAccordionと同構成へ再編（「スタイリング例」新設・「タイトルのHTMLタグを変更する」「複数同時展開を制限する」に分割・HTMLタブ追加・Propsに`open`追記）。MCP headings同期 |
| Tabs | 未着手 | |
| Modal | **実装・docs完了、コミット済み（`41cdb7c2`）** | OpenBtn/CloseBtnへ`b--modal_openBtn`/`b--modal_closeBtn`を追加し、`d="inline-flex"`をCSSの`display: inline-flex`＋`align-items: center`へ移行。`set="plain"`/`hov="-o"`はpropsのまま維持。Rootの`--flow`を`!important`化し、既定アニメーションを0.3s、背景を`rgb(0 0 0 / 0.5)`、blurを4pxへ目視調整。docs ja/enはOverview・長いコンテンツ例・ドロワー例を再構成し、HTMLタブとBodyのスクロール説明を実装へ追随。**MCP `docs-index.json`への「コンテンツが長い場合の例」見出し追加のみ未対応** |
| NavMenu | **完了・コミット済み（`19418195`）** | Link/Root/NestをLismベース化し、デフォルトの`l--flex`/`l--stack`出力を廃止（レイアウトが必要なら`layout="flex"`等を指定）。`.b--navMenu_link`は`display: flex`＋`align-items: center`＋`gap: 0.5em`＋`padding: var(--_item-p)`（`--_item-p: 0.5em`）をCSS管理。`hov="-bgc"`と`itemP` propは存続。`--_item-g`/`itemG`は一度実装後に取り消し（gapは直書きで十分と判断）。docs ja/enはExamples再構成（節順入れ替え・ホバー例を全面刷新しメガメニュー追加・`fxd="row"`→`layout="flex"`）、en全面同期済み。skillsは変更なし、MCP headings同期済み |
| ShapeDivider | **完了・コミット済み（`6495b27b`）** | デフォルトの`--level: 5`をCSSへ移し、`level`指定時だけインライン変数を出力する形へ変更（`level={0}`でDOMを出力しない挙動は維持）。`max-sz="full"`は単なる最大幅ではなく、`has--gutter`直下でガター外まで広げるレイアウト連携を担うためProperty Classのまま維持。docs ja/enはOverview HTMLタブからデフォルト値の`style="--level:5"`を削除し、不足していた4例にもHTMLタブを追加して全5 Previewへ表示。skills/MCPはAPI・見出しに変更がないため修正不要 |
| Avatar | **完了・コミット済み（`d2a9e782`）** | **`c--avatar`→`b--avatar`へリネーム**し、`ar="1/1"`/`bdrs="99"`/デフォルトサイズをCSSへ移行（`--w: 2em`＋`width: var(--w)`。当初1.5emから目視確認で変更）。`size`prop指定時のみ`w`を出力（`getLismProps`はnull/undefinedのpropを出力しない）。Frameベース（`l--frame`）は維持し、react/astroに`_style.css`のimportを追加。docs ja/enはStylesのSrcCode化・`ImportPackage`に`css="style.css"`追加・size初期値2em。skills `components-ui.md`も追随 |
| Alert / Callout | **完了・コミット済み（`5a3e3ab7`）** | 両方**`b--*`へリネーム**。Alert: `ai/p/g/bd/bdrs`をCSSへ移行（`-bd`の`--bds`/`--bdw`/`--bdc`変数フックは忠実移植）。`l--flex`は出力継続（displayはCSSに持たない）、`layout="withSide"`時は`l--withSide`＋`Icon`へ`isSide`直付与。アイコンの`Center`ラッパーを廃止して`Icon`直下化し、内側スタイルは`> .a--icon` / `> .l--flow`の子セレクタで管理（要素クラスなし）。Callout: `p/g/bdc/bd-s/bdw`をCSSへ移行、`l--stack`（Stackベース）維持。ボーダー色は**`--cbox-bdPct: 100%`**で純keycolorを保持（`--bdc`経由のため`bdc` propも従来通り有効）。要素クラスは`b--callout_title`（CSSあり）・`b--callout_body`（マーカーのみ）で、タイトル行の`Center`ラッパーも廃止。u--cboxは両方propsのまま。docs ja/enはStylesのSrcCode化・`ImportPackage`へ`css="style.css"`・HTMLタブ追随（Calloutは「`title`を指定しない場合」等の加筆あり）。skills追随。MCP headings同期は`6ccfa558` |

残りのProps→CSS移行はTabs。ModalはMCP `docs-index.json`の見出し同期のみ残る。

## 決定事項（ユーザー確認済み）

- **後方互換方針は一括移行（破壊的変更）**。旧`c--*`のDOM併記はしない。リリースノートに移行内容を明記する（9ファミリーのプレフィックス置換のみで、要素`_x`・モディファイア`--x`の形式は不変）。
- `b--navMenu` / `b--shapeDivider`の**camelCaseブロック名は維持**（他は全小文字だが揃えない）。
- 1つのPRにまとめる。ブランチに直接コミットを積む方式。
- Props→CSS移行もこのブランチ・同じリリースに乗せ、破壊的変更を1回にまとめる。
- Alert・Avatar・Calloutの空`_style.css`は**削除せず温存**（Props→CSS見直しでスタイルが入る可能性があるため）。
- hover表現はpropsのまま残す（Buttonで決定）。
- **u--cboxはpropsのまま維持**し、cbox由来の色味調整はCSS側の`--cbox-*`変数で行う（Badgeの`--cbox-cPct: 75%`・Calloutの`--cbox-bdPct: 100%`・Chatの`--cbox-bgPct: 8%`が前例）。cboxのcolor-mix計算式をui側へ複製しない。
- **レイヤー順を`lism-base → lism-block → lism-trait → lism-primitive → lism-component → lism-custom → lism-utility`へ変更**（`22de723a`）。`b--`のベーススタイルは、利用者が明示的に足すクラス（`is--*`/`has--*`/`l--*`等）に常に負ける位置に置く（例: `.b--button`の`display: inline-flex`に`.l--grid`の`display: grid`が勝つ）。`lism-component`は旧`@lism-css/ui`互換のため従来位置を維持。**この変更のdocs・skillsへの追随は別issueで行う（uiの調整が終わった後）**。
- Buttonは`display: inline-flex`をCSS側で持ち、デフォルトの`l--flex`出力を廃止する（React/Astroとも`Flex`→`Link`ベースへ変更）。
- **primitiveクラスを残すか外すかの判断基準**（Chatで確定）: primitiveのデフォルト宣言をそのまま使うなら残す（Alert/Callout/Avatar/Chat。`.l--grid > * { min-width: 0 }`等の子ルールも無料で得られる）。primitiveと異なる宣言が必要ならprimitiveを外しCSSが自前で持つ（Button）。レイアウトが任意ならデフォルト出力を廃止し`layout`propで任意指定（Accordion Root）。
- ShapeDividerの`max-sz="full"`はProperty Classのまま維持する。`has--gutter`直下での負のマージンを含む特殊なレイアウト連携であり、`lism-block`へ移すと後段の`is--wrapper`（`lism-trait`）に負ける。コアの`-max-sz:full`ロジックもui側へ複製しない。
- docsの`ImportPackage`のCSS案内整合は本作業では扱わない（docs構造整理側で対応）。
- purgeプラグインのシグネチャ（`packages/plugin/src/purge/shared.ts:9`）に`b`が無い件は**対応不要と判断**。purgeが削除するのはコア`full.css`由来のknown selectorのみで、uiの`b--`クラスは元々削除対象にならず、削れるセレクタを含むCSSは他プレフィックスで必ずマッチするため実害なし。

## 実施済みコミット

| コミット | 内容 |
| --- | --- |
| `2a2a1622` | lism-ui本体: 9コンポーネント（Accordion/Badge/Button/Chat/Details/Modal/NavMenu/ShapeDivider/Tabs）のCSS・React/Astro出力・JSセレクタ・テストを`b--*`/`lism-block`へ移行 |
| `93aabac2` | `src/style.scss`にModal/Tabs/Detailsを追加（`@lism-css/ui/style.css`とCDN配布の収録漏れ解消） |
| `5f704b55` | docs: MDX（ja/en）・Opt-in CSS・サイト自身の上書きCSS・`rehype-preview.ts`・`documents/docs-md.md`を追随 |
| `8e1f7c4c` | templates/lp: ryokan・corporate（ja/en）のui上書きCSSを追随 |
| `8b1ff96b` | skills: `lism-css-guide/components-ui.md`を追随 |
| `68b14472` | mcp: `docs-index.json`をUIページ再編（別作業`128450ae`/`725bb28b`）とb--移行へ同期、`meta.ts`更新 |
| `22de723a` | core: `lism-block`レイヤーを`lism-base`直後へ移動（`b--`ベーススタイルをtrait/primitiveより弱く） |
| `3df1c81d` | ui/docs: ButtonのベーススタイルをPropsからCSSへ移行（inline-flex化・デフォルト`l--flex`廃止・docs追随） |
| `7b252eed` | docs: ButtonのPreviewにHTMLタブ追加・見出し調整（ユーザーによるコミット） |
| `34c3492b` | ui/docs/mcp: BadgeのベーススタイルをCSSへ移行、ピル型デフォルト化、docs再構成 |
| `d2a9e782` | ui/docs/skills: Avatarを`b--avatar`へリネームしベーススタイルをCSSで管理 |
| `5a3e3ab7` | ui/docs/skills: Alert/Calloutを`b--*`へリネームしベーススタイルをCSSへ移行 |
| `6ccfa558` | mcp: Alert/Calloutのdocs再構成へ`docs-index.json`のheadingsを同期 |
| `2973a310` | ui/docs/mcp: AccordionのベーススタイルをPropsからCSSへ移行、Root/ButtonのLismベース化、docs再構成 |
| `0f5cacfb` | ui/docs/mcp: DetailsのベーススタイルをPropsからCSSへ移行、summary/contentのデフォルトpadding追加、docs再構成 |
| `34af1576` | ui/docs/skills/mcp: ChatのベーススタイルをPropsからCSSへ移行、variant=thinkを標準スタイルへ昇格 |
| `19418195` | ui/docs/mcp: NavMenuのベーススタイルをPropsからCSSへ移行、Link/Root/NestのLismベース化、docs再構成 |
| `6495b27b` | ui/docs: ShapeDividerのデフォルトlevelをCSSへ移行し、docsの全PreviewへHTMLタブを追加 |
| `41cdb7c2` | ui/docs: ModalのOpenBtn/CloseBtnへ専用クラスを追加し、inline-flexをCSSへ移行、docs ja/enを再構成 |

補足: React/Astroの出力クラスは移行前から完全一致しており、差異修正は不要だった。ChatのCSS末尾にある`@layer`外の2ルール（詳細度確保のため意図的）はレイヤー外のまま維持。

## 意図的に`c--`のまま残したもの（誤って変更しないこと）

- **`skills/lism-css-guide/antipatterns.md`の`.c--button:hover`**: `c--card`/`c--link`と並ぶCustom Class一般のNG例。`b--`化すると「`b--`はCSS管理してよい」という規約と矛盾するため据え置き。
- docs独自クラス（`c--snsLinks`・`c--preview_*`等）、templates独自クラス（`c--ryokan-*`・`c--header_menuNav`等）、`packages/plugin/src/purge/shared.test.ts`のフィクスチャ。

## 検証状況

- `68b14472`時点: `nr build:ui` / `nr build:docs` / `nr lint` / `nr test`（monorepo 149件＋MCP 66件）/ `nr typecheck`すべて成功。`dist/style.css`に`c--`が残っていないことも確認済み。
- レイヤー順変更（`22de723a`）時点: `nr build:core` / `nr lint` / `nr test`成功。`main.css`/`full.css`に新順序が反映され、no-layer版は影響なし（コアの`lism-block`は空のため）。
- Button移行（`3df1c81d`）: `nr build:ui` / `nr typecheck` / `nr test`成功、`dist/style.css`への反映とユーザーの目視確認済み。docsのサイズ調整例・Only lism-css例の`w="fit"`削除等の調整もコミットに含む。
- Badge移行（`34c3492b`）・Avatar移行（`d2a9e782`）: `nr build:ui` / `nr typecheck` / `nr test`成功、`dist/style.css`への反映とユーザーの目視確認済み。
- Alert・Callout移行（`5a3e3ab7`）: `nr build:ui` / `nr typecheck` / `nr test`（`--force`全実行）/ `nr lint`成功、`dist/style.css`への反映とユーザーの目視確認済み。MCP同期（`6ccfa558`）後も`@lism-css/mcp`のテスト66件成功。
- Accordion移行（`2973a310`）・Details移行（`0f5cacfb`）・Chat移行（`34af1576`）: `nr build:ui` / `nr typecheck` / `nr test` / `nr lint`成功、`dist/style.css`への反映とユーザーの目視確認済み。
- NavMenu移行（`19418195`）: `nr build:ui` / `nr build:docs` / `nr typecheck` / `nr test` / `nr lint`成功、`dist/style.css`への反映とユーザーの目視確認済み。docs jaはユーザー自身が再構成し、enはjaの確定版へ全面同期。
- ShapeDivider移行（`6495b27b`）: `nr build:ui` / `nr build:docs` / `nr typecheck` / `nr test` / `nr lint`成功。`dist/style.css`への`--level: 5`反映を確認済み。docs ja/enの全5 PreviewへHTMLタブを揃えた最終状態でも`nr build:docs`成功。ユーザーのコミット指示を受けて完了。
- Modal移行（`41cdb7c2`）: `nr build:ui` / `nr build:docs` / `nr typecheck` / `nr test` / `nr lint`成功。`dist/style.css`へOpenBtn/CloseBtnの`display: inline-flex`と`align-items: center`が反映され、コンポーネントのデフォルト出力から`-d:inline-flex`が消えたことを確認済み。docs ja/en再構成後もビルド成功、ユーザーの目視確認済み。

## 残タスク（Props→CSS移行以外）

### リリース時対応

- リリースノートに破壊的変更（`c--*`→`b--*`の一括移行）と移行方法を明記。
- バージョンは0.x系のminor bump想定（v0.26.0）。

### 別issueで対応するもの

- レイヤー順変更（`22de723a`）のdocs・skills追随（cascade layers系ページ・skillsのレイヤー順記載）。uiの調整がすべて終わった後に行う。
- Chatの`@lism-css/ui`からの削除検討＋docsのui/examples・Patterns再編。整理案は`documents/memo-chat-removal-examples-reorg.md`を参照（削除は破壊的変更のため、実施するならv0.26.0への同乗が望ましい点に注意）。

### スコープ外として未対応の既知残件

- templates/blogの**英語版**記事（`.lang/en/`配下の`lism-css-intro`）に旧`lism-component`レイヤーの記述が残存（#553の翻訳追随漏れ。日本語版は更新済み）。
- `apps/docs`の`core-components/Lism.mdx`用のMCP snippetに「classNameでc--クラスや任意クラスを指定」という表現あり（`b--`併記を検討してもよい。未対応）。

## 根拠・参照

- 方針の大元: Issue #545（`b--`/`c--`2分類の規約）、PR #546（コア側`lism-block`レイヤー追加済み: `packages/lism-css/src/scss/_with_layer.scss:7`）、Issue #550（本作業）。
- CSSの配布経路: 各コンポーネントが`_style.css`を個別import＋`src/style.scss`→`dist/style.css`（`package.json`の`exports["./style.css"]`、README、docsのCDN案内で使用）。
