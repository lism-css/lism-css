基準日: 2026-09-12・コミットe76345fc（作業ツリーの変更を含む）

# 対象グループとコピーの編集

`{icon}`はkebab-caseのアイコン名。次の名前は探索の入口とし、実ファイルで存在と重複を確認する。収録数やアートボード番号は固定しない。

| 役割 | グループ名 | レイヤー |
| --- | --- | --- |
| 原寸 | `{icon}` | `01 Editable masters - 24px` |
| light一覧 | `gallery-light-{icon}` | `03 Gallery icons` |
| bold一覧 | `gallery-bold-{icon}` | `03 Gallery icons` |
| 作図の線 | `stroke-{icon}` | `05 Study strokes` |
| 作図の塗り | `fill-{icon}` | `07 Study fills` |
| 補助図形 | `guide-{icon}` | `06 Construction guides` |
| 説明 | `text-{icon}` | `04 Labels and dimensions` |
| 座標グリッド | `grid-{icon}` | `08 Coordinate grids - 2px` |

regular一覧は原寸そのもの。塗りアイコンも独立した名前の原寸を持つ。関連アイコンの命名だけでは、同じ変更を適用してよいとは判断しない。

配置変更では対象の説明・作図の線や塗り・補助図形・座標グリッドを同じ量だけ移し、移動先のセクショングループへ所属も揃える。見出しの件数と空いた行の余白を整える。絶対座標は記録せず、移動後のグリッドから取得する。

## 形状の反映

- グループの索引は1回作って使い回す。選択中の項目やコレクションの番号だけで対象を選ばない。
- 原寸・一覧の24×24の透明矩形と、作図グリッド内の透明な`coordinate-frame`から原点を求める。シンボル化したグリッドではこの枠を必須とし、シンボルの外接枠を配置基準にしない。枠のない旧形式は、シンボルを含まずグループ枠が24×24の場合だけ互換対応する。
- 各頂点のanchor・左右ハンドルをローカル座標で扱う。同じ形状のコピーは、原点の差だけ移して更新する。線幅や不透明度まで原寸の値で上書きしない。
- 既存パスの役割と構造が対応するときは、そのパスを更新する。部品の追加・削除では構造も確認し、コピー元とコピー先のパス順を無条件に対応させない。
- ガイドと説明は、変更した寸法・接点・端点に関係する項目を更新する。塗り版はregularの外形を基準とし、単純な倍率や線幅変更で代用しない。

## 検証・復元

ヘルパーの形状比較は座標を小数第4位へ丸めた比較で、色・線幅・透明な座標枠を除く。シンボルは展開せず、参照名・部品名・配置枠を別に取得する。シンボルを含むコピーの形状一致は未判定とする。`paths`・`points`・`widths`は通常パスの集計で、シンボル内部は含まない。パスの向きや頂点構成が違えば、同じ見た目でも不一致になる。角度・半径・接線連続・塗りの穴は変更内容に応じて別に検証する。

復元時も現在の作業状態を保護する。バックアップから対象の原寸・一覧・作図・説明を取り出し、対象外の変更が残ることを確認する。別名保存した作業文書とバックアップの参照を混同しない。

## ガイドの内部構造

`guide-{icon}`の共通部品は`part-{部品キー}`にまとめる。キーは`upper-turn`などの役割名を優先し、配置座標を識別子にしない。既存の座標付きキーは部品更新時に実座標へ追従する。可視の24×24枠は`part-frame-24x24`とし、グリッドの透明な`coordinate-frame`と区別する。

| グループ名 | 内容 |
| --- | --- |
| `reference-frames` | 基準枠の部品 |
| `reference-circles` | 基準円の部品 |
| `contact-points` | 接点マーカー |
| `arc-centers` | 単独の中心記号 |
| `construction` | 個別の円弧・骨格などの通常パス |
| `part-{部品キー}` | 単体または円＋中心セットを置く部品。既存の局所角丸はガイド直下にもある |

新しいグリッドは、`grid-{icon}`直下に共通Gridシンボルと24×24の矩形を置く。矩形を`coordinate-frame`と名付け、塗り・線・クリッピングを無効にし、シンボルの座標領域に揃える。グリッド全体の外接枠へ揃えると線幅分ずれる。

## セクションを追加する

1. 各役割のレイヤーに`Geometry {2桁ID} - {名称} / {役割}`を作る。役割は`text`・`stroke`・`fill`・`guide`・`grid`。使わない線・塗りのグループは空のままでよい。
2. 各アイコンの役割グループを同じIDのセクションへ所属させる。`text`直下の見出し・件数はTextFrameとし、アイコンの説明は`text-{icon}`内に入れる。空セクションは配置対象にできない。
3. 作図背景グループへ、同じ列の区切り線を複製して`section-divider-{2桁ID}`と名付ける。
4. [配置設定](../scripts/layout_studies.json)の該当列へIDを追加し、必要な派生形だけ`breakBefore`を指定する。`regularColumns`は左右2列、`fillColumns`は各列末尾の塗り用セクションを1つずつ持つ。
5. 以下の再配置を実行する。列の左端は先頭セクションの区切り線を基準とするため、アイコンの削除で移動しない。列自体を動かすときは基準の区切り線も動かす。

## 制作操作

共通部品の使い分けと中心記号の有無は[設計文書](../../../../packages/icons/design/original/design.md#共通ガイドの部品化と配置)に従う。シンボル名は.ai内の定義から取得する。

共有シンボルの編集見本は`Symbols - Edit library`アートボードの`10 Symbol edit library`レイヤーに置く。見本は定義へのリンクを保ち、すべて原寸で配置する。細部はIllustratorの表示を拡大し、選択ツールで見本をダブルクリックして定義を編集する。Escで一覧へ戻る。通常選択による変形とリンク解除は見本だけに作用し、共有定義や他の配置を更新しない。

一覧を更新するときは、次を実行する。`--check`は読み取り専用、`--apply`は未保存の文書で停止し、保存済みファイルのバックアップを作って一覧を再生成する。`--source-path`では一時的な検証用ファイルを指定できる。定義の作成・統合・削除は行わない。パッケージビルドには含めない。

```bash
python3 .claude/skills/edit-icons/scripts/symbol_library.py --check
python3 .claude/skills/edit-icons/scripts/symbol_library.py --apply
```

```bash
python3 .claude/skills/edit-icons/scripts/guide_parts.py list --match "Circle R10"
python3 .claude/skills/edit-icons/scripts/guide_parts.py place {icon} --symbol "{シンボル名}" --part {部品キー} --x {中心x} --y {中心y} --check
python3 .claude/skills/edit-icons/scripts/guide_parts.py place {icon} --symbol "{シンボル名}" --part {部品キー} --x {中心x} --y {中心y} --apply
```

中心座標は24px枠内のローカル座標。円単体の名前に`--with-center`を付けると、対応する円＋中心セットを1つ配置する。セット名を直接指定してもよい。中心だけなら`Center`単体を指定する。縦向きの枠は横向きの定義に`--rotate 90`を付ける。回転後も指定した中心座標に配置する。

新規部品は種類に応じたカテゴリへ置く。インスタンス名はシンボル名の形状部分を使い、`Circle R0.75 + Center`や`Frame 24x24`とする。既存部品は親カテゴリを維持する。同じ`part-{部品キー}`を指定するとその部品を更新する。セットから十字を外すときは、円単体の名前を`--with-center`なしで指定する。通常パスが混在する部品は自動置換しない。Gridはこのコマンドでガイドへ配置しない。シンボル定義自体の変更は、Illustratorのシンボル編集で行う。

新規アイコンの作図セットは、原寸を`01 Editable masters - 24px`に作ってから生成する。

```bash
python3 .claude/skills/edit-icons/scripts/new_study.py {icon} --section {2桁ID} [--after {icon}] [--from {icon}] --check
python3 .claude/skills/edit-icons/scripts/new_study.py {icon} --section {2桁ID} [--after {icon}] [--from {icon}] --apply
```

指定セクションに`grid-`（Gridシンボルと`coordinate-frame`）、`text-`（名前ラベル）、作図コピー、`guide-`（`part-frame-24x24`だけ）を作る。作図コピーは名前が`-fill`で終わるものを`fill-`、それ以外を`stroke-`とし、原寸を複製して不透明度35%と参照アイコンの作図色にする。`--after`は同じセクションのそのアイコンの右隣、省略時は最終行の下に仮配置する。`--from`は兄弟アイコンのガイドと説明テキストを複製し、名前ラベルだけ置き換える。参照アイコンは`--after`か、セクション末尾のアイコン。生成後に再配置を実行する。

既存の作図セットへ兄弟アイコンのガイドと説明を写す。

```bash
python3 .claude/skills/edit-icons/scripts/guide_parts.py copy {from} {to} --check
python3 .claude/skills/edit-icons/scripts/guide_parts.py copy {from} {to} --apply
```

既定では`guide-{to}`と`text-{to}`の内容を置き換え、名前ラベルだけ`{to}`にする。`--only-missing`は`{to}`にない`part-*`だけを同じカテゴリへ追加し、説明は変えない。複製後に、半径・寸法・注記など`{to}`固有の値を直す。

作図説明の追加・削除・並べ替え後は再配置する。生成・複製の直後は移動件数が多くなるのが正常。

```bash
python3 .claude/skills/edit-icons/scripts/layout_studies.py --check
python3 .claude/skills/edit-icons/scripts/layout_studies.py --apply
python3 .claude/skills/edit-icons/scripts/layout_studies.py --check
```

セクション内の順序は現在のグリッド配置から読み取る。列数・間隔・セクション順・改行位置は[配置設定](../scripts/layout_studies.json)に集約する。原寸・一覧・共通Guideは動かさず、作図説明と区切り線・件数・背景を更新する。適用後の確認では移動と背景変更が0件になることを確かめる。

いずれも`--check`は読み取り専用。`--apply`は未保存の文書で停止する。未保存編集も含めて保存する意図がある場合だけ`--allow-unsaved`を付ける。保存済みファイルとライブ文書はそれぞれバックアップする。バックアップは結果に表示する。一時的な検証用ファイルは`--source-path`で指定できる。`guide_parts.py`ではこのオプションを`list`・`place`・`copy`より前に置く。Illustratorへの変更コマンドは同じ文書に対して順番に実行し、前の完了を確認してから次へ進む。処理が約2分を超えるとコマンドはタイムアウトでエラー終了するが、Illustrator側は最後まで動く。表示された作業ディレクトリの`result.json`と`saved`で完了を確認し、同じ更新を重ねない。再配置やガイド変更をパッケージビルドから自動実行しない。
