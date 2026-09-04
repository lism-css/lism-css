---
date: 2026-09-04
task: テンプレートをLism CSS v0.26へ整合
scope: 実装差分と洗い出し表のPass10評価
---

# 評価報告

| 確認項目 | 判定 | 由来Pass |
| --- | --- | --- |
| `class`/`style`/`data-*`/ARIA/handlerの渡し忘れ | OK | 横断 |
| 公開class・CMS・外部JS・E2E依存の変更を⏸にしたか | OK | 横断 |
| CSSだけ直して関連箇所を漏らしていないか | OK | 横断 |
| レスポンシブ配列を単一値に潰していないか | OK | Pass4 / Pass8 |
| CSS整理時に`c--`の名前を消していないか | OK | Pass4 / Pass10 |
| pxを勝手にtokenへ丸めていないか | OK | Pass5 |
| Accordion.Rootの既定値削除・layout追加で意図しない変更がないか | OK | Pass2 / Pass9 |
| ryokanのclass renameがmarkupとCSSで一致するか | OK | Pass7 |
| ThemeSwitchの状態classをCSSとmarkupで同時更新したか | OK | Pass6 / Pass7 |
| Pagefind・Expressive Codeの外部CSS上書きをレイヤー外に維持したか | OK | Pass7 |
| minimalの未使用`@lism-css/ui`依存をmanifestとlockfileから削除したか | OK | Pass1 |
| 洗い出し表の✅・⬜を判定基準に再照合したか | OK | Pass10 |
| 対象範囲を再検索して洗い出し表に漏れがないか。該当なしのPassを記録したか | OK | Pass1 / Pass10 |

NG項目: なし。

違反件数: 0
