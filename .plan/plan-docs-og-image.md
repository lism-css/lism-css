基準日: 2026-09-05・772fc861

# apps/docs のOG画像生成を見直す

状態: Ready

## 概要 / ゴール

サイトリニューアルに合わせて、apps/docs の記事ページ用OG画像（1200×630）を作り直す。

完了時の状態:

- 無地背景に上下2本の罫線、タイトル、説明文、右下ロゴの構成で全ページのOG画像が生成される
- フォントがサイト本体と同じ Gen Interface JP になる（サブセットTTFをリポジトリに同梱）
- タイトル・説明文にフォント未収録の文字が入ると、ビルドがその文字を表示して失敗する
- 背景JPEGとローカルのビルドキャッシュ（`.cache/og/`）が無くなり、生成処理が単純になる

対象外: `public/ogimg-default.png`（記事以外のページ用の既定OG画像）はそのまま。`Head.astro` のメタタグ出力も変更しない。

## 背景・前提（コードで裏取り済み）

- 生成経路は `src/pages/{docs,ui}/og/[...slug].png.ts` と `src/pages/[lang]/{docs,ui}/og/[...slug].png.ts` の4本。いずれも `pageHelpers.ts` の `generateOgImage(lang, slug)` を呼び、`getPostWithFallback` で記事を取得して `ogImage.tsx` の `renderOgSvg(title, _tags)` でSVGを作り、sharp でPNG化する
- apps/docs は静的ビルド（アダプターなし）なので、OG画像は `astro build` 中にNodeで全件生成される。ホスティング先（Vercel、移行後の Cloudflare Workers）の実行環境には依存しない
- 現行テンプレートは `src/assets/og/og-bg.jpg`（68KB）をbase64で埋め込み、`logo.png` と `noto-sans-jp-600.woff`（1.5MB）を読む。タイトルのみ描画し、`tags` は引数にあるが未使用
- ローカルキャッシュは `title`・`tags`・`lang` のMD5をキーに `.cache/og/` へ保存している。`.cache/` はgitignoreで、Vercelのビルドでも復元されないため本番ビルドでは常に全件生成している
- コンテンツスキーマ（`src/content.config.ts`）で `description` は必須。`draft` は本番ビルドで除外される（`getDocsPostsByLang` / `getUiPostsByLang` の `includeDraft` 既定値）
- サイト本体は `Head.astro` で `gen-interface-jp@0.8.0` の `cdn/all.css` を jsDelivr から読み、`_theme.scss` の `--ff--base` を `'Gen Interface JP'` にしている
- 記事のタイトル・説明文の実測（ja/en 各86本、下書きと `_demo` を除く）:

| 項目 | ja | en |
| --- | --- | --- |
| description 文字数 中央値 / 最大 | 44 / 115 | 76 / 184 |
| description 全角換算幅 最大 | 80em | 101em |
| 72px・1040px幅で2行になるタイトル数 | 4 | 2 |
| 使用漢字のユニーク数 | 187 | - |
| 常用漢字・人名用漢字に無い漢字 | 「梱」のみ | - |

- satori の仕様（README と `src/font.ts` で確認済み）: フォント形式は TTF / OTF / WOFF（WOFF2 不可）。複数フォントを渡すと文字ごとにグリフの有無で順にフォールバックする。`lineClamp` と `textOverflow: 'ellipsis'` に対応。未収録の文字はフォールバック先が無いと空白として描かれ、エラーにならない（サブセットTTFで実際に確認）
- 実測ベンチ（同一の無地レイアウト、M系Mac、ウォーム後）: satori+sharp は背景JPEGありで約30ms/枚、無地描画で約14ms/枚。PNGは平均154KBから約60KBになる。直近のビルド出力は4ディレクトリ合計160枚（`dist/` で確認）で、無地描画なら全件で約2秒
- Gen Interface JP v0.8.0 のリリースzip（GitHub `yamatoiizuka/gen-interface-jp`、58MB）の構成: `GenInterfaceJP-0.8.0/Gen Interface JP/GenInterfaceJP-{Thin..ExtraBold}.ttf`（各約6MB）、`Gen Interface JP Display/` 配下に見出し用ファミリー、ルートに `OFL.txt`。ライセンスは OFL-1.1
- npmパッケージ `gen-interface-jp` は woff2 チャンクとCSSのみで、TTFを含まない
- `pyftsubset`（fonttools）はローカルにインストール済み。`unzip` はOS標準

## 実装プラン

1PRで行う。ブランチは `dev` から切り、PRのターゲットも `dev`。

### 1. フォントサブセット生成スクリプトを追加する

`apps/docs/scripts/subset-og-font.ts`（`tsx` で実行、`package.json` に `"og:font": "tsx scripts/subset-og-font.ts"` を追加）。

処理:

1. `apps/docs/.cache/gen-interface-jp/` にリリースzipが無ければ GitHub Releases からダウンロードし、`unzip` で `GenInterfaceJP-Regular.ttf`・`GenInterfaceJP-SemiBold.ttf`・`OFL.txt` だけ取り出す。バージョンはスクリプト冒頭の定数（`0.8.0`、`Head.astro` のCDN版と揃える）
2. 常用漢字・人名用漢字の一覧を Unihan から作る。`https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip` を同じキャッシュ先に落とし、`Unihan_DictionaryLikeData.txt` の `kJoyoKanji`・`kJinmeiyoKanji` を持つコードポイントを集める（2945字前後）
3. 収録文字集合を作る。次の和集合:
   - Unicode範囲の展開: `U+0020-007F, U+00A0-00FF, U+2000-206F, U+2070-209F, U+2100-214F, U+2190-21FF, U+2200-22FF, U+25A0-25FF, U+2600-26FF, U+3000-303F, U+3040-309F, U+30A0-30FF, U+31F0-31FF, U+FF00-FFEF`
   - 手順2の漢字一覧
   - `src/content/{ja,en}/**/*.mdx` 全件（下書き・`_demo` も含む）のfrontmatter `title` と `description` に含まれる文字。frontmatterは `---` 区切りを正規表現で切り出し、行頭の `title:` / `description:` の値から前後の引用符を外して使う
4. 文字集合をコードポイント順に並べ、改行を含めず1行で `src/assets/og/og-font-chars.txt` に書く（ビルド時の照合と `pyftsubset --text-file` の両方がこれを読む。範囲指定を二重に持たないためのただ一つの正）
5. `pyftsubset` を2回実行して `src/assets/og/gen-interface-jp-400.ttf`（Regular）と `gen-interface-jp-600.ttf`（SemiBold）を出力する。オプションは `--text-file=<手順4のファイル> --no-hinting --desubroutinize --layout-features='*' --drop-tables+=DSIG`
6. `OFL.txt` を `src/assets/og/OFL-gen-interface-jp.txt` としてコピーする（OFLはフォント再配布時にライセンス同梱が必要）

出力サイズの目安は各1.3MB。`pyftsubset` が無いときはインストール方法（`pip install fonttools`）を出して終了する。

### 2. 文字カバレッジの照合を追加する

`apps/docs/src/lib/ogFontCoverage.ts`（新規）:

- `findUncoveredChars(text: string, covered: ReadonlySet<string>): string[]` 空白類（`\s`）を無視し、`covered` に無い文字を重複なしで返す純粋関数
- `loadOgFontChars(): Set<string>` `src/assets/og/og-font-chars.txt` を読み、モジュール内でメモ化する。パスは現行 `renderOgSvg` の `assetsDir` と同じく `process.cwd()` 基準で解決する

`apps/docs/src/lib/ogFontCoverage.test.ts` を vitest で追加する（収録済みだけの文字列で空配列、未収録が混ざると該当文字だけ返る、空白が無視される、重複が1つにまとまる）。

`generateOgImage` は描画前にタイトルと説明文を照合し、未収録があれば次の形のメッセージで `throw` する。静的ビルドではエンドポイントの例外でビルドが失敗し、`astro dev` ではそのOG画像URLでエラーになる。

```
[OG] フォントに未収録の文字があります: 梱 (ja/css-files)
pnpm --filter lism-docs og:font を実行してフォントと文字一覧を再生成し、コミットしてください
```

### 3. テンプレートを書き直す

`apps/docs/src/lib/ogImage.tsx` の `renderOgSvg` を `renderOgSvg({ title, description }: { title: string; description?: string })` に変え、以下を描く。数値はユーザー指定で、モック画像の実測とも一致している。実装後に生成PNGを見て微調整してよい。

| 要素 | 指定 |
| --- | --- |
| キャンバス | 1200×630、背景 `#fafafa` |
| 罫線 | 高さ2px、幅いっぱい、色 `#d4d4d4`、上端から64pxと下端から64pxの2本 |
| テキスト列 | left 80px、width 1040px（右も80px空ける）、top 130px（上罫線の下端から64px）、縦並び、gap 32px |
| タイトル | `display: 'block'`、72px、weight 600、lineHeight 1.375、`#1a1a1a`、`lineClamp: 2`、`textOverflow: 'ellipsis'`、`lineBreak: 'strict'`、`wordBreak: 'keep-all'` |
| 説明文 | `display: 'block'`、32px、weight 400、lineHeight 1.625、`#555`、`lineClamp: 3`、`textOverflow: 'ellipsis'`。`description` が空なら要素ごと省く |
| ロゴ | `logo.png` をbase64埋め込み（現行どおり）、高さ36px、right 40px、bottom 106px（下罫線の上端から40px） |

テキスト要素の `display: 'block'` は、satori の `lineClamp` がブロック要素で動くことを確認した組み合わせ（現行テンプレートの `display: 'flex'` では未確認）。位置はすべてボックス基準で、文字のインク位置はフォントの縦メトリクスで決まるため、モックと数px単位でずれて見えることがある。

この寸法での実データ当てはめ（全角1em・半角0.55emの概算）:

- タイトルが2行になるページは ja 4本、en 2本（`SwitchColumns`、`AutoColumns`、`ハーフレディング`、`lism.config.js でのカスタマイズ`）
- 説明文が3行を超えて省略記号になるのは en の `css-files` だけ
- タイトル2行と説明文3行が重なる最悪ケースでは、テキスト列の下端が516pxになりロゴ上端（488px）を28px下回る。ただし干渉するのは説明文3行目の右端がロゴ左端（約987px）に届く場合だけで、現在該当ページは無い。将来出た場合は、説明文のクランプを2行にするか、タイトルサイズを下げる

フォントは `gen-interface-jp-400.ttf` と `gen-interface-jp-600.ttf` を `fonts` に同名 `'Gen Interface JP'` で weight 400 / 600 として渡し、ルート要素に `fontFamily: 'Gen Interface JP'` を指定する。罫線の色は縮小表示やJPEG再圧縮で消えない濃さを優先し、薄くしすぎない。

削除するもの: `og-bg.jpg`、`noto-sans-jp-600.woff`、それらの読み込みコード、`_tags` 引数。

### 4. `generateOgImage` を整理する

`apps/docs/src/lib/pageHelpers.ts` のOG画像関連:

- `renderOgSvg` に `post.data.title` と `post.data.description` を渡す
- 手順2の照合を描画前に入れる
- ローカルキャッシュ（`CACHE_DIR`、`generateCacheKey`、`getCachePath`、キャッシュの読み書き）を削除する。あわせて `createHash` と、OG以外で使っていなければ `fs` / `path` のimportも外す
- `[OG] Generating:` のログは残してよい

### 5. 依存とアセットを更新する

- `apps/docs/package.json` の `satori` を最新の安定版へ上げる（`$package-management` スキルに従う。0.33.2で今回のテンプレートを描画できることは確認済み。0.18.4のままでも動く見込みだが未確認）。`sharp` は据え置き
- `src/assets/og/` の最終構成: `logo.png`、`gen-interface-jp-400.ttf`、`gen-interface-jp-600.ttf`、`og-font-chars.txt`、`OFL-gen-interface-jp.txt`
- ローカルの `apps/docs/.cache/og/` は各自で削除してよい（参照されなくなる）

### 6. ドキュメントを更新する

- `apps/docs/spec.md` の「OG 画像生成」節: エンドポイントのパスが古い（`src/pages/og/...`）ので4本の実パスに直し、キャッシュの記述を削除し、`og:font` の手順と `og-font-chars.txt` の役割を書く
- `apps/docs/README.md`: 技術スタック表の「satori + sharp（キャッシュ付き）」からキャッシュを外し、ディレクトリ構成の `assets/` 説明を更新する
- `docs/decisions.md` に1エントリ追加する（下記「設計判断の根拠」の採用・却下を要約）。作業時点で同ファイルに未コミットの変更がある場合は、それがコミットされてから先頭に追加する

## 設計判断の根拠

- **satori を継続し takumi へ乗り換えない。** 同一レイアウトの実測で処理時間は同等（satori+sharp 15.6ms/枚、takumi native 18.0ms/枚）。今回の設計に要る `lineClamp`・省略記号・複数フォントのフォールバックは satori にある。乗り換えの利点はPNGが小さいこととsharpを直接依存から外せることだが、sharp は Astro の画像最適化でも使っており消えない
- **背景画像をやめて描画する。** 無地と罫線だけなので画像を埋め込む理由がない。処理時間が半分、PNGサイズが3分の1になる
- **説明文を画像に入れる。** X のリンクカードはタイトルを帯で重ねるが説明文はどこにも出ないため、画像内の説明文だけが内容を伝える。Discord や Slack ではテキストと重複するが害はない。1040px幅・32pxでは en の `css-files` だけが3行を超え、省略記号で切れる
- **ロゴを右下に置く。** X の帯は最下端の細い領域に重なるだけで、罫線の上に置いたロゴとは重ならない（実サイトのカード表示で確認）
- **フォントを Gen Interface JP にする。** サイト本体と同じ書体に揃える。npm配布は woff2 のみで satori が読めないため、リリースzipのTTFをサブセットして同梱する
- **Display ではなく標準ファミリーを使う。** zipには見出し用の Gen Interface JP Display も入っているが、サイト本体の `--ff--base` が標準ファミリーなので、OG画像も同じにする
- **サブセットTTFをコミットする。** フルTTFは2本で12MBになるためgitに入れない。ビルド時にzipを取得する案は毎回58MBの取得がCIとホスティング先のビルドで走るため却下。サブセットは各1.3MBで、現行の `noto-sans-jp-600.woff`（1.5MB）と同じ運用に収まる
- **文字集合は常用漢字・人名用漢字に記事の実文字を足す。** 常用漢字だけだと「同梱」の「梱」が今の時点で欠ける。ビルド時に抽出してサブセットまで行う案は、元TTFがビルド環境に要るためフルTTF同梱に戻ってしまい却下
- **未収録文字は検知してビルドを止める。** satori は未収録文字を空白で描いてエラーにしないため、放置すると欠けた画像が公開される。Noto Sans JP をフォールバックに残す案は見た目の差がほぼ無い利点があるが、400と600で3MBを抱え続けるため却下。止まったら `og:font` を再実行してコミットする運用にする
- **ローカルキャッシュを廃止する。** 本番ビルドでは元々効いておらず、無地描画なら全160枚が約2秒で終わるため維持する価値がない。キーにテンプレート版や説明文が入っていない現状では、デザイン変更後に古い画像が残る事故の原因にもなる。Cloudflare Workers 移行プラン（`.plan/plan-511-docs-to-cloudflare-workers.md`）が挙げている「`.cache/og/` が永続化されない」懸念も、本プラン完了で無くなる
- **ロゴはPNGのまま。** `public/logo.svg` をインラインSVGで渡す案は satori 側の対応を検証していないため今回は見送る

## 未決事項・要確認・事前準備

- 罫線の色、タイトルと説明文のインク位置、ロゴとの距離は実装後に生成PNGを見て微調整する（目視確認はユーザーが行う）
- 事前準備: `pyftsubset` が使えること（`pip install fonttools`）、GitHub Releases と unicode.org へのネットワーク到達
- Gen Interface JP を更新するときは `Head.astro` のCDN版数とスクリプトの定数を同時に上げる

## 完了条件 / テスト方針

- `nr build:docs` が成功し、`dist/{docs,ui,en/docs,en/ui}/og/` のPNG枚数が変更前のビルドと同じ（着手前に数えておく。基準日時点の `dist/` では58・22・58・22の計160枚）
- 次のページのPNGを目視する: ja の `css-files`（「梱」が描かれる、説明文が最長）、ja の `customize/config`（タイトル「lism.config.js でのカスタマイズ」が2行）、ja の `half-leading`（タイトルが2行で説明文も長い。ロゴとの距離を見る）、en の `css-files`（説明文が3行で省略記号になる）
- 否定テスト: 任意の記事の `description` に未収録の文字（例: `𠮷`）を一時的に足して `nr build:docs` が上記メッセージで失敗することを確認し、戻す
- `nr test`（`ogFontCoverage.test.ts` を含む）、`nr lint`、`nr typecheck` が通る
- 生成PNGの平均サイズが現行の154KBから大きく下がっている（目安60KB前後）
