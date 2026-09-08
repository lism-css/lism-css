基準日: 2026-09-08・d669a993の作業ツリー

# Hero05の実装確認

対象: hero05の日英プレビュー、patternsの登録と既存テストの件数更新。

読み取り専用評価サブエージェントによる照合: 規約違反0件。計画と実装は一致。ブラウザでの見た目は未確認。

- ヘッダーはbgc="text"、c="base"、max-sz="s"の塗りつぶし。画像とコンテンツはmax-sz="xl"で中央配置。
- 画像はFrameで角丸にし、md未満は16/9、md以上は21/9。写真は既存のa-2.jpgを仮置き。
- md未満ではナビを2段にし、lg未満では文章とCTAを縦に配置。リンク先は差し替え用の#。
- 全て既存Primitive・ButtonとPropsで実装。独自CSSはなし。既存hero04と同じ下書きとして登録。
- ESLint、Prettier、既存patternsテスト9件、git diff --checkは成功。現行getLismPropsの直接実行で--fxd_lg:rowと--ar_md:21/9の出力を確認。
- ブラウザ確認とサムネイル生成はユーザー規約により未実施。見た目はユーザーによる目視確認が必要。

照合資料: lism-css-guideのSKILL.md、antipatterns.md、antipatterns-layout.md、property-class.md、tokens.md、Primitive詳細、実装プラン、getLismProps、Buttonの現行ソース。

# Hero04の実装確認

対象: hero04の日英プレビューとpatternsの説明。

読み取り専用評価サブエージェントによる照合: 違反0件、要確認0件。計画と実装は一致。
照合資料: lism-css-guideのSKILL.md、primitives/l--columns.md、antipatterns.md、antipatterns-layout.md、property-class.md、tokens.md、実装プラン。

- 外側GridにFrameとColumnsを配置。md以上ではga="1/1"で重ね、画像をms="50%"で右半分に表示。max-sz="xl"のColumns内の左列にヘッダーと文章を配置。
- ヘッダーはLISM文字ロゴとメニューボタンのみ。メニューは外観サンプルで、開閉処理は未実装。リンク先は差し替え用の#。
- md未満では画像をga="2/1"、ar="16/9"で文章の下に配置。角丸、透過、画面外への拡張はなし。
- 画像の固有寸法を行高計算から外すcontain:size以外はPropsを使用。Button、Link、Iconを再利用。
- 参照画像は2530×1750px。2倍表示を作業前提としてボタン高・本文サイズとの整合を確認し、既存トークンに合わせた。写真は既存のa-2.jpgを仮置き。
- ESLint、Prettier整形、日英Astro構文変換、既存patternsテスト9件、git diff --checkは成功。
- ユーザー規約によりブラウザ確認とサムネイル生成は未実施。見た目はユーザーによる目視確認が必要。

実装プランはプロジェクト規約に従い完了時に削除。
