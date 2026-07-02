# 出力フォーマット

このファイルは、`lism-css-refactor`の出力形式をまとめたものです。主な成果物は、次の3つです。

1. 洗い出し表（`.lism/plan.md`へ保存）
2. 修正案のdiff
3. 評価報告（提示前の見直し結果。`.lism/review.md`へ保存）

判定記号は、`lism-css-refactor`用の意味で使います: **✅触らない / 🔧修正する / ⏸ユーザー確認 / ⬜意図的に残す**。

## 1. 洗い出し表

[`checklist.md`](./checklist.md)のPass1で作ります。コード上に実際にあるclass・Props・CSS宣言・styleなどを1行ずつ書き出し、後続Passで判定と根拠を付けます。

| 実体（class/宣言/値/重複） | 確認内容 | 判定 | 根拠 |
| --- | --- | --- | --- |
| `.c--tag{ padding:var(--s10) … }` | Property Classへ移せる | 🔧 | Pass4 / CSSで書かずProperty Classへ |
| `<Cluster ai="center">` | 既定値の重複 | 🔧 | Pass9 / l--cluster既定 |
| `padding: 13px` | tokenにない値 | ⏸ | Pass5 / 丸めはユーザー確認 |
| `<Columns cols={3}>` | すでにLismらしい | ✅ | Pass2 / すでに適切なPrimitive |

- **実体**: class/className・Lism Props・CSS宣言・style属性・@media/@container・重複している束を、まとめずに1行ずつ書く。
- **確認内容**: どのPassで何を確認したかを書く。
- **判定**: 4記号のいずれか。Pass1時点では未確定でもよい。
- **根拠**: 由来Passと、必要なら`lism-css-guide`の参照先を書く。✅・⬜の行も空にしない（Pass10の「判定の再審査」で照合する）。
- **保存先**: 洗い出し表は`.lism/plan.md`として保存し、Pass2–9の判定・根拠はこのファイルを更新する。メタデータヘッダ（日時・対象タスク・対象範囲）等の`.lism/`規約は[guideの`references/verification.md`](../../lism-css-guide/references/verification.md)を参照。

## 2. 修正案のdiff

🔧の行について、diff形式＋根拠つきで提示します。提示前にPass10の見直しを通してください。

````md
### `c--tag` の装飾をProperty Classへ移す
```diff
- .c--tag { font-size: var(--fz--xs); padding: var(--s10); background: var(--base-2); border-radius: var(--bdrs--10); }
+ .c--tag {}
```
```diff
- <span class="c--tag">
+ <span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">
```
- **根拠**: Pass4 / [`antipatterns.md#property-class-で書けるのに-css-で書く`](../../lism-css-guide/antipatterns.md#property-class-で書けるのに-css-で書く)
- **挙動**: 変わらない（CSS変数の値は同じ。`.c--tag` class名は残す）
````

- 1つの修正につき、関わる箇所（CSS / markup / JS / test）をすべてdiffに含める。CSSだけ直してJSやテストを漏らさない。
- **根拠**行に由来Passと参照先を付ける。
- **挙動**行に「変わらない」か「変わる可能性あり（要ユーザー確認）」を明記する。
- 挙動が変わる提案は、通常のリファクタとは分けて提示する。

## 3. ⏸（ユーザー確認が必要な項目）

⏸は、その場で勝手に確定しません。選択肢を添えてユーザーに確認します。

| 項目 | 確認が必要な理由 | 候補 |
| --- | --- | --- |
| `padding: 24px` | spacing tokenに完全一致しないため、丸めるかどうか判断が必要 | A=`p="30"`へ丸め / B=`--s24`をcustom token化 / C=24px直書き例外 |
| `cols={[1,2,3]}`化 | 固定3列をレスポンシブ化すると挙動が変わる | A=現状維持（`cols={3}`）/ B=可変化を採用 |

px丸め・任意色推測・固定Gridの可変化・公開class/外部JS/E2E依存のrenameなどは、すべてこの表で確認します。判断条件は[`checklist.md`](./checklist.md)のPass5/7/8/10を参照してください。

ユーザー確認が取れない状況（自律実行など）では、⏸の行は適用せず現状維持のまま、この表を完了報告に含めます（`SKILL.md`「判定記号」の⏸運用を参照）。

## 4. 評価報告（提示前の見直し表）

Pass10で、修正案をユーザーに提示する前に確認した結果です。`.lism/review.md`へ保存し、NG（違反）ゼロの報告が出るまで修正→再評価を繰り返してから修正案を提示します。完了報告からこのファイルを参照します。

| 確認項目 | 判定 | 由来Pass |
| --- | --- | --- |
| `className`/`style`/`data-*`/ARIA/handlerを渡し忘れていないか | OK | 横断 |
| 公開class/CMS/外部JS/E2Eに依存する変更を⏸にしたか | OK | 横断 |
| CSSだけ直してJS/test/HTML生成側を漏らしていないか | OK | 横断 |
| レスポンシブ配列を単一値に潰していないか | OK | Pass4 / Pass8 |
| CSS空化のついでに`c--`意味classを消していないか | OK | Pass4 / Pass10 |
| pxを勝手にtokenへ丸めていないか | OK | Pass5 |
| 既定値削除で見た目・project overrideを変えていないか | OK | Pass2 / Pass9 |
| 洗い出し表の✅・⬜を判定基準に再照合したか（根拠が空・推測のみの行がないか） | OK | Pass10 |
| 対象範囲を再検索して洗い出し表に漏れがないか。該当なしのPassを記録したか | OK | Pass1 / Pass10 |

NGの行は、実体（file:line）・問題の内容・由来Passを添えて表の下に列挙します。

### 評価サブエージェントへの指示テンプレ

サブエージェント／タスク委任機能が使える環境では、Pass10を読み取り専用の評価サブエージェントに委任します（理由と運用ルールは[guideの`references/verification.md`](../../lism-css-guide/references/verification.md)。基準がguideの実装用チェックではなくこのスキルのPass10になる点だけが違います）。

```md
あなたはLism CSSリファクタの評価者です。修正の意図や経緯は考慮せず、照合だけを行ってください。コードを変更しないでください。

対象: {修正案のdiff、または適用済み変更のdiff}
洗い出し表: .lism/plan.md
照合する資料（このスキルのファイル）:
- {refactorスキルルート}/references/common-mistakes.md（全項目）
- {refactorスキルルート}/references/checklist.md のPass10「判定の再審査」
- 再照合で必要になった各Passの参照先（{guideスキルルート}配下）

確認すること:
1. .lism/plan.mdに洗い出し表が存在するか（無い・実体列挙が空なら評価不能。以降の照合をせず違反として差し戻す）
2. common-mistakes.mdの全項目に該当する変更がないか
3. diffの各変更が洗い出し表の🔧行に対応しているか（対応しない変更はスコープ外の変更として違反）
4. ⏸の行を適用していないか（⏸を🔧・✅に付け替えた形跡や、リスト外の記号・注記の使用を含む）
5. checklist.md Pass10「判定の再審査」（✅・⬜行の再照合・洗い出し表の網羅性・Pass省略の検出）

報告書式（違反ゼロでも作成する）: 「評価報告」の見直し表を埋め、NGの行は実体（file:line）・問題の内容・由来Passを添えて列挙し、最後に違反件数のサマリを書いてください。
```

## 5. 検証・残リスク報告

適用後（ワークフローstep8）に、テスト/ビルド/型チェックの結果と残リスクを報告します。

- 評価報告（`.lism/review.md`）への参照と、違反ゼロで提示したこと。
- 実行したコマンドと結果（例: `nr lint` / `nr typecheck` / `nr test`）。
- 見た目の同一性をどう確認したか（レンダリング確認の結果。確認できない環境では、ユーザーへの目視確認依頼を明記する）。
- 未適用で残した⏸項目と、その理由。
- 挙動が変わる提案を分けた場合は、その一覧とユーザー確認状況。
