# 提示前の見直し

修正案を作った後、**ユーザーへ提示する前**に確認する項目です（[`checklist.md`](./checklist.md)のPass10）。自分の修正案を他人のPRだと思って読み直し、リファクタによって元の見た目や動きを壊していないかを確認します。

ここで見るのは、**元は正しく動いていたものを、自分の変更で壊していないか**です。token typo・px直書き・`is--`誤用など、新規実装時にも起きる一般的なミスはここに重複して書かず、`lism-css-guide`の[`antipatterns.md`](../../lism-css-guide/antipatterns.md)と[`antipatterns-layout.md`](../../lism-css-guide/antipatterns-layout.md)を参照します。

## 最初に必ず見ること

次の3つは、複数のPassで起きやすいため必ず確認します。

- **属性の渡し忘れ**: コンポーネント抽出やPrimitive置換で、`className`/`style`/`data-*`/ARIA/event handlerを落としていないか。元の要素が受け取っていた属性を、置換後も同じように渡しているか。
- **外部依存の変更**: 公開class名・CMS・外部JS・E2Eセレクタに依存するclass名やDOM構造を、勝手に変えていないか。外部依存に触れる変更は⏸としてユーザー確認に回す。
- **関連箇所の更新漏れ**: `is--`→`data-*`、class renameなどで、CSSだけ直してJS・テスト・HTML生成側を漏らしていないか。

## 個別の確認項目

| 確認項目 | 判定 | 由来Pass |
| --- | --- | --- |
| レスポンシブ配列を単一値に潰していないか（`p={[20,30]}`→`-p:20`など） | OK/NG | Pass4 / Pass8 |
| CSSを空にしたついでに`c--`意味classまで消していないか | OK/NG | Pass4 / Pass10 |
| `is--active`→`data-*`に変えた時、CSS/JS/testセレクタも直したか | OK/NG | Pass6 |
| pxを勝手にtokenへ丸めていないか（要確認を飛ばしていないか） | OK/NG | Pass5 |
| 抽出コンポーネントで、propsのレスポンシブ対応が抜けていないか | OK/NG | Pass3 |
| Primitive化・既定値削除でgap/align/幅/見た目が変わっていないか | OK/NG | Pass2 / Pass9 |
| 既定値削除で、project overrideや意図的な上書きまで消していないか | OK/NG | Pass9 |

## 使い方

1. 各項目を修正案のdiffに当てる。
2. NGがあれば、ユーザーへ提示する前に修正案を直す。
3. 丸め・挙動変更などユーザー判断が必要なものは、⏸として提示時に確認する。勝手に確定しない。
4. すべてOKになったら、修正案をdiff形式＋根拠つきで提示する（[`output-format.md`](./output-format.md)）。
