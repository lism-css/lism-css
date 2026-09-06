基準日: 2026-09-06・e2b7ac10

# Patterns再編の実装評価

- 対象: 日本語Patternsの整理、新規13件、既存2件の改修。
- 評価日: 2026-09-06。
- 実行レベル: 通常。既存スクリーンショットは重複の確認に使用し、新規例は独自に設計。
- 基準: lism-css-guide、lism-css、@lism-css/uiの0.28.0。
- 評価方法: 読み取り専用サブエージェントがルールとコードを照合し、Claude Fableと実装担当がスクリーンショットを確認。

## 構成

公開81件から似た構成の31件を外し、下書きだったHero002を改修・公開、新規13件を追加。日本語の公開例は64件。英語の公開IDは従来の81件と一致し、英語プレビュー本文の変更はない。

| カテゴリ | 変更前 | 変更後 | 方針 |
| --- | --- | --- | --- |
| CTA | 4 | 5 | 問い合わせ窓口・横長CTA・登録フォームを用意し、Section005を移動 |
| Hero | 1 | 4 | 画面UI付き・ターミナル付き・文字主体を追加 |
| Feature・Content Links・Footer | 24 | 3・9・2 | 機能紹介3件を新設。既存Feature8件とNavigation007はContent Links、Navigation002・005はFooterへ移動 |
| Price Table | 4 | 2 | カード型を1例残し、機能比較表を追加 |
| Testimonials | 2 | 3 | 一覧型に加え、人物と引用・成果紹介を追加 |
| Member | 6 | 5 | Member002・003を残し、Member005を整理 |
| Posts（旧News・Works） | 8 | 6 | 似た記事一覧を整理し、投稿一覧として統合 |
| General | 20 | 10 | Section009-2・011・012を残し、009・014を整理。005はCTAへ移動。別途、下書き4件も整理 |
| Stats・Logo Cloud・Process | 0 | 各1 | 数字・導入企業・手順という用途を追加 |

新規: hero003、hero004、cta005、cta006、pricetable005、testimonials003、testimonials004、stats001、logos001、process001、feature017、feature018、feature019。

既存改修: hero002、cta002。

Feature017はアイコンと短文の3列、Feature018は共有受信箱の画面と機能説明、Feature019は写真と説明の交互配置。既存のリンク集とは用途で分類し、写真やカード全体へのリンクに頼らず機能と強みを説明する。

日本語のNews・WorksをPostsに統合。一覧・サイドバー・詳細ページのカテゴリ表示と戻り先を揃え、既存のパターンID・個別URL・プレビュー・スクリーンショットは維持する。旧カテゴリのURLはPostsへ転送する。

## デザイン方針

日本語を読みやすい文字サイズと余白に整え、シンプルなレイアウトを優先する。通常の見出しは主に2xl、Heroは狭い幅で2xl・広い幅で4xl。節の余白は40・50を中心とし、強い影・大きな角丸・装飾目的の英字ラベルを抑えた。

種類の違いは画面UI、ターミナル、文字と罫線、フォーム、比較表、人物写真、数字、ロゴ、手順という内容と構成で表す。Logo Cloudは中央見出しと横帯にして、HeroやStatsと構成を分けた。

PriceTable005は機能比較の構成と価格の文字サイズを維持。狭い画面では表全体を横スクロールし、キーボードで右端のプランへ移動できる。320px幅でも比較する列の表示領域を確保するため、固定列は設けていない。

## 評価結果

Lism実装15件の違反0件、ルール上の要確認0件。言語別一覧・サイドバー・ページ生成・言語切替・スクリーンショット対象の不整合0件。

独自CSSは追加せず、Primitive・Lism Props・既存トークンで実装。レスポンシブ値のコンテナ祖先、ネイティブフォーム検証、比較表の見出しとスクロール領域を確認した。

照合した資料:

- SKILL.mdの最小ゲート・判定記号・提出前セルフチェック
- references/authoring.md、references/verification.md
- antipatterns.md、antipatterns-layout.md
- tokens.md、property-class.md
- primitive-class.md、components-core.md、components-ui.md
- responsive.md、利用PrimitiveとTraitの個別資料
- packages/lism-css/config/defaults/props.tsとgetLismPropsのトークン解決

## 検証

- docs本番ビルド成功。
- docsの15テストファイル・155テスト成功。最終の文字と余白の微調整は対象ファイルのPrettier・ESLintとブラウザで確認。
- TypeScript・Astroチェック: エラー0、警告0。既存のヒント11件。
- 変更したTS・AstroファイルのPrettier・ESLint成功。
- git diff --check成功。
- Postsの6件・既存個別URL・画像・戻り先リンク・旧カテゴリからの転送をHTTPで確認。
- Section005のCTA分類・戻り先、復元3件のページと画像、削除2件の非掲載をHTTPで確認。
- Feature・Content Links・Footerの分類、個別URLと画像、旧Navigationカテゴリからの転送を確認。

## 表示・操作確認

- 対象15件を1200px・390px幅で撮影・目視確認。320px幅でもページの横はみ出しと画像の欠落がないことを確認。初回の12件は800px幅でも確認。
- Heroの不自然な改行、引用要素の基本スタイルによる低コントラスト、Processの均等行高による空白、重複する罫線と見出しを修正。
- CTA006は空欄・不正なメール形式を拒否し、正しい形式では送信を行わずデモ完了のステータスを表示。
- PriceTable005は矢印キーで表だけが横スクロールし、右端のプランのリンクへフォーカス可能。
- 一覧のPC・スマートフォン幅で横はみ出しと読み込み済み画像の欠落なし。公開対象は64件・17カテゴリ。
- 対象15件の一覧用PNGと比較用ベースラインを更新。画像サイズは既存仕様の1200×800。対象例にランダム画像はないため、公開用とベースラインは同一画像。
