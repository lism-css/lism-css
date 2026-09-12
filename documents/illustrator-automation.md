基準日: 2026-09-12・コミットe76345fc（作業ツリーの変更を含む）

# Illustrator（.ai）をエージェントから操作するときの注意点

アイコン制作でIllustratorを`osascript`経由のExtendScriptから操作するときの制約をまとめる。設計用・出力用ファイルの役割と操作手順は[制作データ用スクリプト](../packages/icons/scripts/README.md)を参照する。
この文書が持つもの: 止まる・壊れる原因と、その回避策。
持たないもの: アイコンの設計判断（[docs/decisions.md](../docs/decisions.md) の 2026-09-10 のエントリ）と、書き出し SVG の正規化・生成の仕様（`packages/icons/` に実装したらそちらが正）。


## 実行方法

Illustrator 2026（30.7.0）を起動し、[制作データ用スクリプト](../packages/icons/scripts/README.md)の手順で実行する。`run-ai.sh`が前面化と実行を行い、失敗を終了コードへ反映する。

| 制約 | 回避策 |
| --- | --- |
| AppleEvent の応答は約2分で切れる（`with timeout` は当てにならない）。切れてもスクリプトは Illustrator 内で最後まで動く | 1回の呼び出しを短くする（SVG 配置なら10個程度）。結果は戻り値に頼らず、スクリプト内で `File` に UTF-8 で書き出す |
| Illustrator が背面にいると App Nap で処理が止まる。CPU ほぼ0%、ダイアログなし、`activate` すら応答しない | 各呼び出しの直前に `tell application "System Events" to set frontmost of (first process whose bundle identifier is "com.adobe.illustrator") to true` で前面化する。AppleEvent が詰まっていてもアクセシビリティ経由なので効く。前面化した瞬間に処理が再開する |
| `app.doScript`（アクション実行）はモーダルが出て止まる | 使わない。「未使用パネル項目を削除」もコレクションをループで `remove()` する |
| 変数名 `name` は ExtendScript のグローバルと衝突し、アートボード名が "Adobe Illustrator" になる | 変数名に `name` を使わない（`ab.name` のようなプロパティ参照は問題ない） |
| 三項演算子を連鎖すると、Node.jsと異なる順序で評価される場合がある。円の上下左右判定で確認済み | 分岐を`if` / `else`で明示する。Node.jsの模擬検証だけで完了にしない |
| 正規表現リテラルの文字クラス内でも、未エスケープの`/`で構文エラーになる | `\/`へエスケープする。区切り文字の分解だけなら`split()`を使う |
| AppleScript変数の`POSIX file`参照をそのまま渡すと`File/Folder expected`になる場合がある | `tell`の外で`alias`へ変換し、その変数を`do javascript`へ渡す |
| `app.activeDocument`や同名のドキュメントが別ファイルを指していることがある | `fullName.fsName`と対象ファイルの完全パスを照合して選ぶ。新規ドキュメントは作ってすぐ`saveAs`する |
| `/tmp`と`/private/tmp`など、同じ実体を別パスで開くと別文書として保持され、保存状態が食い違う | 開く前にパスを実体へ正規化し、検証用コピーも同じ表記で扱う |

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
- パネル項目を整理するときは参照の有無を確認する。設計用.aiの`LISM /`シンボルは共通ガイドの定義なので、一括削除しない。不要と確認した項目だけを末尾から`remove()`する。
- `SymbolItem.geometricBounds`は元のパスの線幅を含む外接枠になる。置き換え時は元の`visibleBounds`に合わせ、座標グリッドの原点には透明な`coordinate-frame`を使う。シンボルを通常のパスと同じ外接枠として扱わない。
- `SymbolItem.matrix`は取得できない。読み取り専用の検査では参照名と配置枠を報告し、それだけで変形や内部形状が一致すると判定しない。
- `SymbolItem.zOrderPosition`は実機でInternal errorになる場合がある。重ね順の検証では親の`pageItems`から直下の項目順を取得する。
- シンボルを置換した後は`app.redraw()`で描画を確定してから保存する。置換直後の保存だけでは、ファイルに反映されても文書の`saved`が`false`のまま残る場合がある。
- 試作ドキュメントを閉じるときは `doc.close(SaveOptions.DONOTSAVECHANGES)`。


## 書き出し

- `doc.exportForScreens(folder, ExportForScreensType.SE_SVG, opt, item, "")`。`opt` は `ExportForScreensOptionsWebOptimizedSVG` で `cssProperties = PRESENTATIONATTRIBUTES`、`coordinatePrecision = 3`、`svgId = SVGIDMINIMAL`、`svgMinify = false`、`svgResponsive = false`。`item.artboards = "1-" + doc.artboards.length`、`item.document = false`。
- 出力先は指定フォルダ直下ではなく `SVG/` サブフォルダ。ファイル名はアートボード名。
- 出力にはルートの `id="a" data-name="レイヤー 1"`、アートボード名の `<g id="b" data-name="...">`、背景 `<rect>`、`stroke="#000"` が含まれる。円弧 `a` は `c` になる。`<circle>` / `<line>` / `<polyline>` と線属性は保たれる。
- 透明な座標枠に回転が残っていると、SVGに`transform`が出る。出力用.aiではアートボードが座標枠を持つため、同期時に透明な枠だけを除く。描画するパスの形状は変えない。
- 検証は固定の収録数・順序・配置を使わない。アートボードは24×24と名前の形式・重複を確認し、書き出したSVGはパッケージ化に必要な対応形式を確認する。
