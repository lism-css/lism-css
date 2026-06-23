# 出力フォーマット

リファクタの3つの成果物（Inventory表 → 修正案diff → Self-review表）の固定フォーマットです。verdictはrefactor系（✅触らない / 🔧修正対象 / ⏸要ユーザー判断 / ⬜意図的に残す）を使います。

## 1. Inventory表

[`checklist.md`](./checklist.md) Pass 1で出力します。コード上の実体を1行ずつ棚卸しし、各行に必ずverdictと根拠を付けます。チェックリストではなく**実体の列挙**です。黙って落とす項目をゼロにします。

| 実体（クラス/宣言/値/重複） | パス所見 | verdict | 根拠 |
|---|---|---|---|
| `.c--tag{ padding:var(--s10) … }` | Property Classへ移せる | 🔧 | Pass 4 / antipatterns: CSSで書く |
| `<Cluster ai="center">` | 既定値の重複 | 🔧 | Pass 9 / l--cluster既定 |
| `padding: 13px` | トークン外 | ⏸ | Pass 5 / 丸めはユーザー確認 |
| `<Columns cols={3}>` | 既にidiomatic | ✅ | 対象外 |

- **実体**: class/className・Lism Props・CSS宣言・style属性・@media/@container・重複束を、まとめずに1行ずつ。
- **パス所見**: どのPass（2–9）で何を見たか。
- **verdict**: 4記号のいずれか。Pass 1時点では未確定（後続パスで埋める）でよい。
- **根拠**: 由来Passと、guideのルート先（[`antipatterns.md`](../../lism-css-guide/antipatterns.md)の該当節など）。

## 2. 修正案diff

🔧の各行について、diff形式＋ルール出典つきで提示します（[`checklist.md`](./checklist.md) Pass 10のSelf-review通過後）。

````md
### `c--tag` の装飾束をProperty Classへ
```diff
- .c--tag { font-size: var(--fz--xs); padding: var(--s10); background: var(--base-2); border-radius: var(--bdrs--10); }
+ .c--tag {}
```
```diff
- <span class="c--tag">
+ <span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">
```
- **出典**: Pass 4 / [`antipatterns.md#property-class-で書けるのに-css-で書く`](../../lism-css-guide/antipatterns.md#property-class-で書けるのに-css-で書く)
- **挙動**: 不変（CSS変数の値は同一。`.c--tag`クラス名は残す）
````

- 1つの修正につき、関わる箇所（CSS / markup / JS / test）をすべてdiffに含める。CSSだけ直してJSやテストを漏らさない。
- **出典**行に由来Passとguideアンカーを必ず付ける。
- **挙動**行に「不変」か「変わる（要sign-off）」を明記する。挙動が変わる提案は隔離する。

## 3. ⏸（要ユーザー判断）の提示

⏸はdiffを確定させず、選択肢を添えて確認します。勝手に確定しない【必須チェックポイント】。

| 項目 | 要確認理由 | 候補 |
|---|---|---|
| `padding: 24px` | spacing tokenに完全一致しない近似丸め | A=`p="30"`へ丸め / B=`--s24`をcustom token化 / C=24px直書き例外 |
| `cols={[1,2,3]}`化 | 固定3列のレスポンシブ化は挙動変更 | A=現状維持（`cols={3}`）/ B=可変化を採用 |

px丸め・任意色推測・固定Gridの可変化・公開class/外部JS/E2E依存のrename等は、すべてこの表で確認します（条件は[`checklist.md`](./checklist.md)のPass 5/7/8、[`common-mistakes.md`](./common-mistakes.md)の横断退行を参照）。

## 4. Self-review表

提示前（Pass 10）に、draft diffを[`common-mistakes.md`](./common-mistakes.md)で再照合した結果です。NGがあれば提示前に直します。

| 確認項目 | 判定 | 由来パス |
|---|---|---|
| 透過漏れ（className/style/data-*/ARIA/handler） | OK | 横断 |
| 外部契約への断行（公開class/CMS/外部JS/E2E）を⏸にしたか | OK | 横断 |
| 同時更新（CSSだけ直してJS/test/HTML生成を漏らさない） | OK | 横断 |
| レスポンシブ配列を単一値に潰していないか | OK | Pass 4 / Pass 8 |
| CSS空化のついでに`c--`意味クラスを消していないか | OK | Pass 4 / Pass 10 |
| pxを勝手にtokenへ丸めていないか | OK | Pass 5 |
| 既定値削除で見た目・project overrideを変えていないか | OK | Pass 2 / Pass 9 |

## 5. 検証・残リスク報告

適用後（ワークフローstep 8）にテスト/ビルド/型チェックの結果と残リスクを報告します。

- 実行コマンドと結果（例: `nr lint` / `nr typecheck` / `nr test`）。
- 未適用で残した⏸項目と、その判断待ち理由。
- 挙動が変わる提案を隔離した場合は、その一覧とsign-off状況。
