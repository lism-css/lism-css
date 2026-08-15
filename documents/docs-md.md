# docs-md integration（PR #331）処理フロー

`apps/docs/src/integrations/docs-md/`に置かれているAstro integration。
ビルド時にMDXレンダリング後のHTMLからAI向けの`.md`ファイルと`llms.txt`を生成する。

Refs: #283 / PR #331


## 全体像

Astroのビルドフックを利用して、以下3系統のジョブを実行する。

1. **HTML → Markdown変換**: `dist/{path}/index.html`を読み込み、unifiedパイプラインで整形して`dist/{path}.md`を出力
2. **UI一覧`.md`生成**: `data-pagefind-body`を持たない`/ui/` `/en/ui/`の一覧ページの代替として、content collectionから`dist/ui.md` `dist/en/ui.md`を生成
3. **`llms.txt`生成**: `src/content/en/**/*.mdx`のfrontmatterを集計して`dist/llms.txt`を出力


## 1. integration本体（`index.ts`）

| フック | 処理 |
|--------|------|
| `astro:config:done` | `config.site` を `siteUrl` として保持（絶対 URL 化用）。`content/en` の絶対パスも保持 |
| `astro:build:done` | `pages` を走査し、対象パスのページについて HTML → MD 変換を実行。続けて UI 一覧 `.md`、最後に `llms.txt` を生成 |

### 対象ページの判定

`INCLUDE_PREFIXES`に該当するパスのみ処理する：

- `docs/`
- `ui/`
- `en/docs/`
- `en/ui/`

`patterns/` `page-layouts/` `templates/` `_demo/` `preview/` `og/`等は対象外。

### スキップ条件

`article[data-pagefind-body]`が存在しないページ（リダイレクト先・インデックスページ等）は例外を投げて警告ログを出しスキップする。


## 2. HTML → Markdown変換（`convert-html-to-md.ts`）

unifiedパイプラインを以下の順で適用する。

| # | プラグイン | 役割 |
|---|----------|------|
| 1 | `rehype-parse` | HTML をパースして hast に変換 |
| 2 | `rehype-extract-meta` | `<head>` から `<title>` / `<meta name="description">` / `<link rel="canonical">` を抽出し `file.data` に保管 |
| 3 | `rehypeKeepArticle`（ローカル） | `article[data-pagefind-body]` だけを残す。無ければ throw |
| 4 | `rehype-strip-noise` | `nav.c--postNav` / `<script>` / `<style>` / `data-astro-cid-*` / `c--copyBtn` / `c--urlCopyBtn` 等のノイズを除去 |
| 5 | `rehype-preview` | `c--preview_area` / `c--preview_help` / `b--tabs_list` / `__decorator` / `c--preview_title` 等のプレビュー UI を除去 |
| 6 | `rehype-code-language` | `<pre data-language="X">` の言語名を `<code class="language-X">` に転記 |
| 7 | `rehype-docs-link` | `<a class="c--docsLink">` の中身をタイトル文字列のみに畳み込む（タイトル + 説明文の二重出力を抑止） |
| 8 | `rehype-callouts` | `c--docsNote` を GFM Alert（`> [!NOTE]` 等）に変換 |
| 9 | `rehype-absolute-urls` | `/foo` 形式のルート相対 URL を `{siteUrl}/foo` に展開 |
| 10 | `rehype-remark` | hast → mdast に変換 |
| 11 | `remark-gfm` | GFM 拡張を有効化 |
| 12 | `remark-stringify` | mdast → Markdown 文字列化（`bullet: '-'`, `rule: '-'`, `fences: true`, `incrementListMarker: false`） |

### Callout種別マッピング

`c--callout`の`keycolor`からGFM Alert種別への変換：

| keycolor | GFM Alert |
|----------|-----------|
| blue / gray / purple | `[!NOTE]` |
| green | `[!TIP]` |
| orange | `[!IMPORTANT]` |
| yellow | `[!WARNING]` |
| red | `[!CAUTION]` |

### 後処理

- **GFM Alertアンエスケープ**: `remark-stringify`が`[`を`\[`にエスケープしてしまうため、既知種別のホワイトリスト（NOTE / TIP / IMPORTANT / WARNING / CAUTION）に限定して`\[!XXX]`を`[!XXX]`に戻す
- **Frontmatter付与**: `rehype-extract-meta`で抽出したtitle / description / urlをYAML frontmatterとしてMDの先頭に付与する。titleからは` - Lism CSS`サフィックスを除去

### 絶対URL化のルール

- 変換する: `a` / `img` / `source` / `iframe`の`/foo`形式
- 変換しない: `#anchor` / `mailto:` / 既存の絶対URL / プロトコル相対 (`//host`)


## 3. `llms.txt`生成（`build-llms-txt.ts`）

英語ドキュメント（`apps/docs/src/content/en/**/*.mdx`）のfrontmatterを集計してセクションごとにエントリを並べる。

### 除外条件

- `_demo/`配下
- `test.mdx`
- `draft: true`のファイル
- `title`または`description`が無いファイル（警告ログ出力後にスキップ）

### セクション分類（`classify()`）

| セクション | 対象 |
|----------|------|
| **Getting Started** | トップレベルの `overview` / `installation` / `changelog` / `features` / `mcp` / `skills`（順固定） |
| **Documentation** | `docs/` 配下の他すべて（上記以外） |
| **UI Components** | `ui/`直下（`ui/block-examples/`・`ui/components/`を除く。`ui/DummyText` も含む） |
| **Optional** | `ui/block-examples/*` / `ui/components/*` / `property-class/*` |

### ソート順

- **Getting Started**: `GS_ORDER`の固定順（学習導線）
- それ以外: `title`の昇順

### URL生成（`toUrl()`）

llms.txtの慣習に従い、HTMLページではなく`.md`バージョンを指す。

- `ui/Xxx.mdx` → `{siteUrl}/en/ui/{slug}.md`
- それ以外 → `{siteUrl}/en/docs/{slug}.md`

### 出力形式

```
# Lism CSS

> Lism CSS is a lightweight, layout-first CSS framework ...

- GitHub: ...
- npm: ...
- License: MIT

## Getting Started

- [Title](URL): description
...

## Documentation

...
```


## 4. UI一覧`.md`生成（`build-ui-index-md.ts`）

`/ui/`と`/en/ui/`の一覧ページは`excludeFromSearch`により`data-pagefind-body`を持たないため、通常のHTML → MD変換パイプライン（`convert-html-to-md.ts`）ではskipされる。その代替として、一覧のリンク集`.md`（`dist/ui.md`と`dist/en/ui.md`）を独立して生成する。

- **frontmatter（title / description / url）**: ビルド済みの`dist/{lang}/ui/index.html`から`rehype-extract-meta`と同等の抽出処理で取得し、一覧ページ本体の内容と同期させる
- **本文**: `content/{ja,en}/ui/`配下を`walkMdx`で走査して組み立てる。`_`で始まるファイル・ディレクトリと`draft: true`のファイルは除外する
- **見出し分け**: `ui/`直下は`## Blocks`、`block-examples/`配下は`## Block Examples`、`components/`配下は`## Components`の見出しにまとめ、それぞれタイトルの昇順でソートする
- **リンク先**: 各エントリは個別ページの`.md`（`convert-html-to-md.ts`が生成済みのもの）を指す

呼び出し元は`index.ts`の`astro:build:done`フック内（`index.ts:81-94`）で、ja版・en版それぞれに対して1回ずつ実行される。


## 5. `vercel.json`

`*.md`パスに`X-Robots-Tag: noindex`ヘッダーを付与し、検索エンジンへのインデックスを抑止する（AI向けクロールは許容、検索結果には載せない方針）。


## 出力の確認方法

`.md`ファイル数や`llms.txt`のエントリ数はコンテンツの増減によって変わるため、固定値としては記録しない。ビルド完了時に`astro:build:done`フックのログ（`generated N markdown files (M skipped)` / `generated llms.txt (N entries)`）で件数を確認できる。

スキップは想定内のケース（`/ui/` `/en/ui/`のインデックスページ — `data-pagefind-body`不在によるもの）のみが発生する想定。それ以外のページがスキップされた場合は原因を調査すること。

### 失敗時の挙動

`article[data-pagefind-body]`が無いページは`ArticleNotFoundError`としてskipされるが、それ以外の例外（rehypeプラグインのTypeError、I/O失敗、HTMLパス不整合など）はそのままrethrowされてbuildを失敗させる。これにより`llms.txt`が指す`.md`だけが密かに欠落する事故を防ぐ。


## 関連ファイル

```
apps/docs/src/integrations/docs-md/
├── index.ts                  # integration 本体（フック登録 / ページ走査）
├── convert-html-to-md.ts     # HTML → MD 変換パイプライン
├── build-llms-txt.ts         # llms.txt 生成
├── build-ui-index-md.ts      # UI 一覧 .md（ui.md / en/ui.md）生成
├── rehype-strip-noise.ts     # ノイズ DOM 除去
├── rehype-preview.ts         # プレビュー UI 除去
├── rehype-code-language.ts   # コード言語名の転写
├── rehype-callouts.ts        # callout → GFM Alert
├── rehype-docs-link.ts       # c--docsLink の中身をタイトルのみに畳み込み
├── rehype-extract-meta.ts    # <head> メタ抽出
├── rehype-absolute-urls.ts   # ルート相対 URL → 絶対 URL
└── util.ts                   # 共通ユーティリティ
```
