# Self-reviewゲート（退行集）

修正案のdraftを作った後、**ユーザーへ提示する前**に走らせる退行チェックです（[`checklist.md`](./checklist.md) Pass 10）。自分の修正案を**他人のPR**として読み、「リファクタしたから踏む退行」だけを潰します。

このファイルは**退行系専用**です。「ゼロから書く時のミス」（token typo・px直書き・`is--`誤用などのアンチパターン）はここに再掲せず、guideの[`antipatterns.md`](../../lism-css-guide/antipatterns.md)へrouteします。ここで見るのは「正しく書かれていたものを、自分の変更で壊していないか」です。

## 全パス共通の退行（横断・必ず確認）

特定パスでなく複数パスで踏むため、最初に必ず確認します。

- **透過漏れ**: 抽出/置換で`className`/`style`/`data-*`/ARIA/event handlerを渡し忘れていないか。元の要素が受けていた属性を、抽出後のコンポーネント・置換後のPrimitiveが同じように透過しているか。
- **外部契約は⏸**: 公開class名・CMS・外部JS・E2Eセレクタに依存する箇所のrename/構造変更を断行していないか。外部契約に触れる変更は確定せず⏸で提示する。
- **同時更新**: `is--`→`data-*`、クラスrenameなどで、CSSだけ直してJS/テスト/HTML生成側を漏らしていないか。markup・CSS・JS・testsを同時に更新したか。

## 個別の退行

| 確認項目 | 判定 | 由来パス |
|---|---|---|
| レスポンシブ配列を単一値に潰していないか（`p={[20,30]}`→`-p:20`） | OK/NG | Pass 4 / Pass 8 |
| CSSを空にしたついでに`c--`意味クラスまで消していないか | OK/NG | Pass 4 / Pass 10 |
| `is--active`→`data-*`に変えてCSS/JS/testセレクタを直し忘れていないか | OK/NG | Pass 6 |
| pxを勝手にtokenへ丸めていないか（要確認を飛ばしていないか） | OK/NG | Pass 5 |
| 抽出コンポーネントでpropsのレスポンシブ対応が抜けていないか | OK/NG | Pass 3 |
| primitive化・既定値削除でgap/align/幅/見た目が変わっていないか | OK/NG | Pass 2 / Pass 9 |
| 既定値削除でproject overrideや意図的上書きを消していないか | OK/NG | Pass 9 |

## 使い方

1. 各項目をdraft diffに当て、NGがあれば修正案を直す（提示前に直す）。
2. 丸め・挙動変更など、判断がユーザーに属する残課題は⏸として提示時に確認する。勝手に確定しない。
3. OKが揃ったら、修正案をdiff形式＋ルール出典つきで提示する（[`output-format.md`](./output-format.md)）。
