---
name: lism-css-refactor
description: "既存のLism CSSコード（React/Astro/HTML/CSS）を棚卸しして、挙動を変えずにidiomaticへ寄せるリファクタ用スキル。div手組み→Primitive化、CSS束→Property Class化、token逸脱・is--誤用・命名・レスポンシブ・既定値重複の検出と修正案提示を、Inventory→順序パス→Self-reviewの手順で行う。ユーザーがリファクタ・監査・整理を明示的に依頼した時に起動する。"
---

# Lism CSSリファクタガイド

既存のLism CSSコードを**棚卸し（Inventory）→順序パス→Self-reviewゲート**の手順で監査し、**挙動を変えずに**idiomaticな書き方へ寄せるためのスキルです。ユーザーが明示的にリファクタ・監査・整理を依頼した時に起動します。

新規実装（デザイン/要件→コード）の作法は別スキルの[`../lism-css-guide/SKILL.md`](../lism-css-guide/SKILL.md)が担います。このスキルは**既存コード→監査**の後ろ向き手順だけを持ち、Lismの一般知識（token値・Primitive選定・命名規則など）は複製せずguideへrouteします。

> バージョン依存の判断（token値・Primitive既定・API）は`lism-css-guide`に従います。guideの対象バージョンを基準にしてください。

## 前提とフォールバック

このスキルはguide（`lism-css-guide`）が同階層に導入済みであることを前提に、`../lism-css-guide/*`へrouteします。

guideが未導入の場合は、ユーザーに`lism skill add`でguideを導入するよう案内してください。guide未導入のまま、推測でリファクタ判断を進めないでください。

## ワークフロー（厳守）

0. **スコープ確定**。対象ファイル/コンポーネント/選択範囲を明示する。勝手に全体へ広げない。
1. **読む**。対象コード・周辺・利用箇所（CSS/JS/テスト/HTML生成側）を読む。
2. **Inventory表を出力**。コード上の実体（class/Props/CSS宣言/style/@media/重複束）を1行ずつ棚卸しする（[`references/output-format.md`](./references/output-format.md)）。
3. **順序パスでverdict**。Pass 1–9で各行にverdictを付ける。判断に迷う行だけguideへrouteする（[`references/checklist.md`](./references/checklist.md)）。
4. **draft diffを作る**。修正案のdiffを作る。まだ提示しない。
5. **Self-reviewゲート**（Pass 10）。draftを他人のPRとして[`references/common-mistakes.md`](./references/common-mistakes.md)で退行を再照合する。提示の前に必ず走らせるforcing function。
6. **修正案を提示**。Self-review後の修正案をdiff形式＋ルール出典つきで出す。⏸（px丸め・色推測など要確認）はここでユーザー確認する。勝手に確定しない【必須チェックポイント】。
7. **適用**。ユーザーが実装を許可している場合だけ適用する。挙動不変・最小diffを明記する。
8. **検証と報告**。テスト/ビルド/型チェックを通し、残リスクを報告する。

詳細は[`references/checklist.md`](./references/checklist.md)（順序パス）、[`references/output-format.md`](./references/output-format.md)（Inventory表・diff・Self-review表）、[`references/common-mistakes.md`](./references/common-mistakes.md)（退行集）を参照してください。before→afterの実例は[`examples/`](./examples/markup.md)にあります。

## 原則

- **挙動不変**。リファクタは見た目・挙動を変えない。変わる提案は「これは挙動が変わる」と隔離し、別途sign-offを取る。
- **最小diff**。idiomaticな箇所は触らない（churnを生まない）。
- **外部契約は⏸**。公開class名・外部JS・E2Eセレクタ・CMSに依存する箇所のrename/構造変更は断行しない。
- **同時更新**。`is--`→`data-*`などCSSだけ直してJS/テスト/HTML生成を漏らさない。
- **透過を保つ**。抽出/置換で`className`/`style`/`data-*`/ARIA/event handlerを渡し忘れない。

## verdict語彙（refactor系）

| 記号 | 意味 |
|---|---|
| ✅ | 触らない（既にidiomatic／対象外） |
| 🔧 | 修正対象（修正案あり） |
| ⏸ | 要ユーザー判断（px丸め・色推測・挙動変更・外部契約など） |
| ⬜ | 意図的に残す（合意済み例外・独自意図が明確） |

> **forward系（guide）との衝突注意**: guideのAuthoring Plan（forward系）では✅=確定、⬜=直書き許容の例外で、refactor系とは✅と⬜の意味が反転します。どちらの系統の表かを必ず明示してください。共通は⏸（要確認）のみ。

## 順序パス概要

順序に意味があります（先に構造を決めないと個別監査が無駄になる）。各パスはInventory表の1列を埋める作業です。詳細は[`references/checklist.md`](./references/checklist.md)。

| パス | 見るもの | 主なroute先（guide） |
|---|---|---|
| Pass 1 | 棚卸し（実体を全列挙） | なし（Inventoryの入口） |
| Pass 2 | 構造（div手組み→Primitive/Trait） | [`primitive-class.md`](../lism-css-guide/primitive-class.md)、[`antipatterns.md#レイアウト選択ミス`](../lism-css-guide/antipatterns.md#レイアウト選択ミス) |
| Pass 3 | 重複（3箇所以上→コンポーネント抽出） | [`components-core.md`](../lism-css-guide/components-core.md) |
| Pass 4 | Property Class抽出（CSS束→Props） | [`property-class.md`](../lism-css-guide/property-class.md)、[`antipatterns.md#property-class-で書けるのに-css-で書く`](../lism-css-guide/antipatterns.md#property-class-で書けるのに-css-で書く) |
| Pass 5 | トークン監査（px直書き・存在しない値） | [`tokens.md`](../lism-css-guide/tokens.md)、[`antipatterns.md#px--固定値の直書き`](../lism-css-guide/antipatterns.md#px--固定値の直書き) |
| Pass 6 | trait/状態/バリエーション（`is--`誤用） | [`trait-class.md`](../lism-css-guide/trait-class.md)、[`antipatterns.md#is---の誤用状態バリエーション`](../lism-css-guide/antipatterns.md#is---の誤用状態バリエーション) |
| Pass 7 | 命名（kebab-case・何でも`c--`） | [`naming.md`](../lism-css-guide/naming.md)、[`css-rules.md#独自プレフィックス`](../lism-css-guide/css-rules.md#独自プレフィックス) |
| Pass 8 | レスポンシブ（base抜け・固定Grid・isContainer） | [`responsive.md`](../lism-css-guide/responsive.md)、[`antipatterns.md#レスポンシブ抜け`](../lism-css-guide/antipatterns.md#レスポンシブ抜け) |
| Pass 9 | 既定値重複（Primitive既定の重ね指定） | [`primitives/l--*.md`](../lism-css-guide/primitives/l--frame.md)、[`antipatterns.md#primitive-既定値の重複指定`](../lism-css-guide/antipatterns.md#primitive-既定値の重複指定) |
| Pass 10 | Self-reviewゲート（退行の再照合） | [`references/common-mistakes.md`](./references/common-mistakes.md) |

## guide参照ルーティング表

判断に迷う箇所だけguideのローカルファイルを読みます（refactorはこれらを複製しません）。

| 調べたいこと | 読むguideファイル |
|---|---|
| 典型ミス（NG→OK） | [`antipatterns.md`](../lism-css-guide/antipatterns.md) |
| レイアウト選定 | [`primitive-class.md`](../lism-css-guide/primitive-class.md)（必要なら`primitives/l--*.md`） |
| トークン（余白・色・角丸・影・fz） | [`tokens.md`](../lism-css-guide/tokens.md) |
| Property Classへ移せるか | [`property-class.md`](../lism-css-guide/property-class.md) |
| CSSレイヤー・`c--`・`z--`/`p--` | [`css-rules.md`](../lism-css-guide/css-rules.md) |
| 命名・prefix・camelCase | [`naming.md`](../lism-css-guide/naming.md) |
| `is--`/`has--` Trait | [`trait-class.md`](../lism-css-guide/trait-class.md) |
| レスポンシブ・コンテナクエリ | [`responsive.md`](../lism-css-guide/responsive.md) |
| React/Astroコンポーネント | [`components-core.md`](../lism-css-guide/components-core.md) |
| UIコンポーネント置換 | [`components-ui.md`](../lism-css-guide/components-ui.md) |

## このスキルファイル自身のアップデート方法

ユーザーがスキル更新を依頼した場合は、`lism skill add`または`lism skill update`を案内してください。最新を確認したい場合は、GitHubリポジトリの`skills/lism-css-refactor`を参照してください。
