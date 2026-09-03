基準日: 2026-09-03・コミット c9bd1a6b

# 意思決定の記録

## 2026-09-03: ドキュメントの iframe プレビューは等倍で埋め込む（zoom / transform で縮小しない）

apps/docs の PreviewFrame は、狭い本文幅でも広いビューポートのレイアウトを見せるため、iframe を表示幅より広く描画して CSS zoom で縮めていた。しかし Safari 26.3 以前は親の zoom を iframe 内へ伝えないため、中身の高さにフィットさせる処理が崩れてスクロールバーが出た。補正を入れれば直るが、縮小前提の高さ計算と、旧 WebKit の zoom バグ（width・margin・calc() の扱い。Safari 26.4 で修正）への対処が残り続ける。

- 決定: 中身は等倍で埋め込む。サイズ切替はモバイル 380px・タブレット 640px・デスクトップは本文幅で、いずれも本物のビューポート幅になる。広い画面で見たい場合は「別タブで表示」を使う。
- 却下: zoom を残して補正する案（コミット cf2de844 の状態）。Chrome と旧 Safari で挙動が分かれ、幅の整数丸めで 1px 未満のはみ出しが出るなど保守が重い。
- 却下: transform: scale() での縮小。iframe 内の dialog アニメーションで表示位置がずれる。
- 受容: 目次ありの MDX ページでは本文幅（880px）までしか見えない。

## 2026-08-15: Chatを`@lism-css/ui`から削除し、docsの作例へ移す

Chatはprimitives（Grid・Frame・Flow・Decorator・cbox）の組み合わせと少量のCSSで組めるため、汎用UI語彙でもJS付きインタラクティブUIでもなく、パッケージ内で立ち位置が浮いていた。時刻・既読・footer等の要求も発散しやすい。

- 決定: `@lism-css/ui`から削除し、docsの`/ui/block-examples/chat/`で`b--chat`の作例として紹介する。作例のCSSを`@layer lism-block`へコピーすれば、マークアップ変更なしで同じ見た目になる。
- 決定: パッケージに残すかの線引きは「手で書けない仕組みを持つか」。ShapeDividerはSVGパス生成があるので残す。
- 決定: docsの`ui/`は「Blocks / Block Examples / Components」の3分類にする。
- 却下: `c--chat`として紹介する。`b--`は「ベーススタイルをCSS管理する基礎部品」の印でパッケージ提供物専用ではない。利用者のプロジェクトにも`lism-block`レイヤーがあり、コピーしたCSSを`lism-block`へ置き`lism-custom`で上書きする運用はアーキテクチャそのまま。
- 却下: Patterns / Parts セクションの新設。上記3分類に吸収した。

## 2026-08-15: `@lism-css/ui`のクラスを`c--*`から`b--*`へ一括移行し、`c--`のまま残すものを固定する

#545の規約でuiの提供物は`b--`（ベーススタイルをCSS管理）と決めたため、#550で9ファミリーのプレフィックスを一括で置き換えた。

- 決定: 後方互換の`c--*`併記はしない破壊的変更。要素`_x`・モディファイア`--x`の形式は不変。`b--navMenu` / `b--shapeDivider`のcamelCaseは維持する。
- 決定: レイヤー順は`lism-base → lism-block → lism-trait → lism-primitive → lism-component → lism-custom → lism-utility`。`b--`のベーススタイルは利用者が明示的に足す`is--*` / `has--*` / `l--*`等に常に負ける位置に置く。
- 決定: `skills/lism-css-guide/antipatterns.md`の`.c--button:hover`は`c--`のまま残す。Custom Class一般のNG例であり、`b--`化すると「`b--`はCSS管理してよい」規約と矛盾する。
- 決定: docs独自クラス（`c--snsLinks`・`c--preview_*`等）、templates独自クラス（`c--ryokan-*`・`c--header_menuNav`等）、`packages/plugin/src/purge/shared.test.ts`のフィクスチャも`c--`のまま。
- 決定: primitiveクラスを残すかの基準。primitiveの既定宣言をそのまま使うなら残し（Alert / Callout / Avatar / Tabs）、異なる宣言が要るなら外してCSSが自前で持つ（Button）。レイアウトが任意なら既定出力を廃止し`layout` propで指定する（Accordion Root）。
- 決定: `u--cbox`はpropsのまま維持し、色味の調整はCSS側の`--cbox-*`変数で行う。cboxのcolor-mix計算式をui側へ複製しない。

## 2026-08-05: mockupの共有viteキャッシュはrename占有で排他する

`@lism-css/mockup`は依存最適化のviteキャッシュを複数プロセスで共有する。viteはキャッシュのcommitを連続の`renameSync`で行い、プロセス間の排他が無いため、同じcacheDirへ同時に書くと片方がENOTEMPTY / ENOENTで失敗し、負けた側はブラウザ表示が壊れる。

- 決定: 共有パスを`<共有パス>.inuse.<pid>`へrenameして原子的に占有する（`packages/mockup/src/core/cache-claim.ts`の`claimViteCacheDir`）。各プロセスが書くのは自分のpid名のディレクトリだけで、renameの元になるのは共有パスと死んだpidの残骸のみ。残骸は次の起動で回収する。
- 決定: 占有できなければ`null`を返し、呼び出し側はプロセス固有ディレクトリへ退避する。キャッシュ再利用を諦めて毎回事前バンドルするだけで機能は同じなので、この関数は例外を投げない。
- 却下: stale回収専用の第2ロックで直列化する案。回収用mutexがクラッシュで残ると、以後の回収が止まる。
- 却下: stale回収をせず、取れなければ常に退避する案。クラッシュ1回でOSのtmp掃除まで共有キャッシュが使えなくなる。
- 受容: pid再利用によるABA。生きたプロセスの占有ディレクトリを他プロセスが動かす操作は存在しないが、pidの再利用だけは区別できない。
