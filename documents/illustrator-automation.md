基準日: 2026-09-10・コミット0dd0cee2（作業ツリーの変更を含む）

# Illustrator（.ai）をエージェントから操作するときの注意点

アイコンの正本 `lism-icons.ai` を、エージェントが `osascript` 経由の ExtendScript で作成・配置・書き出しした時に分かった制約をまとめる。
この文書が持つもの: 止まる・壊れる原因と、その回避策。
持たないもの: アイコンの設計判断（[docs/decisions.md](../docs/decisions.md) の 2026-09-10 のエントリ）と、書き出し SVG の正規化・生成の仕様（`packages/icons/` に実装したらそちらが正）。


## 実行方法

Illustrator 2026（30.7.0）を起動した状態で、ExtendScript の `.jsx` をファイルに書き、次で流す。

```bash
osascript -e "tell application id \"com.adobe.illustrator\" to do javascript (POSIX file \"/絶対パス/script.jsx\")"
```

スクリプトの最後の式の値が標準出力に返る。

| 制約 | 回避策 |
| --- | --- |
| AppleEvent の応答は約2分で切れる（`with timeout` は当てにならない）。切れてもスクリプトは Illustrator 内で最後まで動く | 1回の呼び出しを短くする（SVG 配置なら10個程度）。結果は戻り値に頼らず、スクリプト内で `File` に UTF-8 で書き出す |
| Illustrator が背面にいると App Nap で処理が止まる。CPU ほぼ0%、ダイアログなし、`activate` すら応答しない | 各呼び出しの直前に `tell application "System Events" to set frontmost of (first process whose bundle identifier is "com.adobe.illustrator") to true` で前面化する。AppleEvent が詰まっていてもアクセシビリティ経由なので効く。前面化した瞬間に処理が再開する |
| `app.doScript`（アクション実行）はモーダルが出て止まる | 使わない。「未使用パネル項目を削除」もコレクションをループで `remove()` する |
| 変数名 `name` は ExtendScript のグローバルと衝突し、アートボード名が "Adobe Illustrator" になる | 変数名に `name` を使わない（`ab.name` のようなプロパティ参照は問題ない） |
| `app.activeDocument` は別ドキュメントを指していることがある | `app.documents[i].name === "lism-icons.ai"` で探して `app.activeDocument = doc` にする。新規ドキュメントは作ってすぐ `saveAs` し、名前を確定させる |

止まったように見えたら、まず前面化を試す。ダイアログの有無は System Events の `windows` で見られるが、Illustrator のウィンドウは別 Space にあると列挙されないので、前面化してから調べる。


## 配置（SVG → アートボード）

- アートボードは `doc.artboards.add([left, top, right, bottom])`。y は上向きで、2行目以降は `top = 24 - row * (24 + gap)` のように負になる。並べ直すときは、対応するグループも同じ差分で`translate()`する。
- `doc.groupItems.createFromFile(new File(path))` で SVG をグループとして置く。グループの `geometricBounds` は SVG 先頭の背景 `<rect fill="none">` の大きさになる。Phosphor の raw は 256×256 の rect を持つので、9.375% に縮めると 24×24 になり、`g.position = [left, top]` だけでアートボードに合う。
- 24グリッドで自作する SVG にも `<rect width="24" height="24" fill="none"/>` を入れる。ないと外形が絵の大きさになり、左上寄せで位置がずれる。この rect は書き出し後に正規化で除去する。
- `g.resize(K, K, true, true, true, true, K, Transformation.TOPLEFT)` で線幅ごと縮む（256グリッドの 16 → 1.5）。第7引数が `changeLineWidths` で、API の既定値は 100（線幅を変えない）なので必ず同じ倍率を渡す。
- SVGの角丸`rect`は、縮小後も角丸半径だけ元の値が残る場合がある。`calendar`・`lock`・`lock-open`で確認済み。配置後に元SVGの半径へ縮小率を掛けた値を確認し、不一致なら`pathItems.roundedRectangle(top, left, width, height, rx, ry)`で外枠を作り直す。今回の正しい半径は`8 × 0.09375 = 0.75pt`。線属性と重ね順を保ち、書き出したSVGの`rx`・`ry`も確認する。
- 配置後は `g.geometricBounds` と `artboardRect` の一致を全件確認する。


## 保存・整理

- `IllustratorSaveOptions` で `pdfCompatible = false`、`compressed = true`。同じパスへの `saveAs` は確認ダイアログなしで上書きされるので、上書き前に別名コピーを残す。
- 未使用パネル項目は `symbols` / `graphicStyles` / `patterns` / `gradients` / `swatchGroups` / `swatches` / `spots` を末尾からループして `remove()` する。既定のブラシ8個・グラフィックスタイル1・スウォッチグループ1は削除できず残る。47アイコンで 267KB → 163KB。
- 試作ドキュメントを閉じるときは `doc.close(SaveOptions.DONOTSAVECHANGES)`。


## 書き出し

- `doc.exportForScreens(folder, ExportForScreensType.SE_SVG, opt, item, "")`。`opt` は `ExportForScreensOptionsWebOptimizedSVG` で `cssProperties = PRESENTATIONATTRIBUTES`、`coordinatePrecision = 3`、`svgId = SVGIDMINIMAL`、`svgMinify = false`、`svgResponsive = false`。`item.artboards = "1-" + doc.artboards.length`、`item.document = false`。
- 出力先は指定フォルダ直下ではなく `SVG/` サブフォルダ。ファイル名はアートボード名。
- 出力にはルートの `id="a" data-name="レイヤー 1"`、アートボード名の `<g id="b" data-name="...">`、背景 `<rect>`、`stroke="#000"` が含まれる。円弧 `a` は `c` になる。`<circle>` / `<line>` / `<polyline>` と線属性は保たれる。
- 検証は、ファイル数＝アートボード数、全件 `viewBox="0 0 24 24"`、線描画は `stroke-width="1.5"`、`data-name`＝アートボード名、の4点。
