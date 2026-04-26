# docs-md integration（PR #331）処理フロー

`apps/docs/src/integrations/docs-md/` に置かれている Astro integration。
ビルド時に MDX レンダリング後の HTML から AI 向けの `.md` ファイルと `llms.txt` を生成する。

Refs: #283 / PR #331


## 全体像

Astro のビルドフックを利用して、以下 2 系統のジョブを実行する。

1. **HTML → Markdown 変換**: `dist/{path}/index.html` を読み込み、unified パイプラインで整形して `dist/{path}.md` を出力
2. **`llms.txt` 生成**: `src/content/en/**/*.mdx` の frontmatter を集計して `dist/llms.txt` を出力


## 1. integration 本体（`index.ts`）

| フック | 処理 |
|--------|------|
| `astro:config:done` | `config.site` を `siteUrl` として保持（絶対 URL 化用）。`content/en` の絶対パスも保持 |
| `astro:build:done` | `pages` を走査し、対象パスのページについて HTML → MD 変換を実行。最後に `llms.txt` を生成 |

### 対象ページの判定

`INCLUDE_PREFIXES` に該当するパスのみ処理する：

- `docs/`
- `ui/`
- `en/docs/`
- `en/ui/`

`templates/` `_demo/` `preview/` `page-layout/` `og/` 等は対象外。

### スキップ条件

`article[data-pagefind-body]` が存在しないページ（リダイレクト先・インデックスページ等）は例外を投げて警告ログを出しスキップする。


## 2. HTML → Markdown 変換（`convert-html-to-md.ts`）

unified パイプラインを以下の順で適用する。

| # | プラグイン | 役割 |
|---|----------|------|
| 1 | `rehype-parse` | HTML をパースして hast に変換 |
| 2 | `rehype-extract-meta` | `<head>` から `<title>` / `<meta name="description">` / `<link rel="canonical">` を抽出し `file.data` に保管 |
| 3 | `rehypeKeepArticle`（ローカル） | `article[data-pagefind-body]` だけを残す。無ければ throw |
| 4 | `rehype-strip-noise` | `nav.c--postNav` / `<script>` / `<style>` / `data-astro-cid-*` / `c--copyBtn` / `c--urlCopyBtn` 等のノイズを除去 |
| 5 | `rehype-preview` | `c--preview_area` / `c--preview_help` / `c--tabs_list` / `__decorator` / `c--preview_title` 等のプレビュー UI を除去 |
| 6 | `rehype-code-language` | `<pre data-language="X">` の言語名を `<code class="language-X">` に転記 |
| 7 | `rehype-docs-link` | `<a class="c--docsLink">` の中身をタイトル text のみに畳み込む（タイトル + 説明文の二重出力を抑止） |
| 8 | `rehype-callouts` | `c--callout` を GFM Alert（`> [!NOTE]` 等）に変換 |
| 9 | `rehype-absolute-urls` | `/foo` 形式のルート相対 URL を `{siteUrl}/foo` に展開 |
| 10 | `rehype-remark` | hast → mdast に変換 |
| 11 | `remark-gfm` | GFM 拡張を有効化 |
| 12 | `remark-stringify` | mdast → Markdown 文字列化（`bullet: '-'`, `rule: '-'`, `fences: true`, `incrementListMarker: false`） |

### Callout 種別マッピング

`c--callout` の `keycolor` から GFM Alert 種別への変換：

| keycolor | GFM Alert |
|----------|-----------|
| blue / gray / purple | `[!NOTE]` |
| green | `[!TIP]` |
| orange | `[!IMPORTANT]` |
| yellow | `[!WARNING]` |
| red | `[!CAUTION]` |

### 後処理

- **GFM Alert アンエスケープ**: `remark-stringify` が `[` を `\[` にエスケープしてしまうため、既知種別のホワイトリスト（NOTE / TIP / IMPORTANT / WARNING / CAUTION）に限定して `\[!XXX]` を `[!XXX]` に戻す
- **Frontmatter 付与**: `rehype-extract-meta` で抽出した title / description / url を YAML frontmatter として MD 先頭に prepend。title からは ` - Lism CSS` サフィックスを除去

### 絶対 URL 化のルール

- 変換する: `a` / `img` / `source` / `iframe` の `/foo` 形式
- 変換しない: `#anchor` / `mailto:` / 既存の絶対 URL / プロトコル相対 (`//host`)


## 3. `llms.txt` 生成（`build-llms-txt.ts`）

英語ドキュメント（`apps/docs/src/content/en/**/*.mdx`）の frontmatter を集計してセクションごとにエントリを並べる。

### 除外条件

- `_demo/` 配下
- `test.mdx`
- `draft: true` のファイル
- `title` または `description` が無いファイル（警告ログ出力後にスキップ）

### セクション分類（`classify()`）

| セクション | 対象 |
|----------|------|
| **Getting Started** | トップレベルの `overview` / `installation` / `changelog` / `features` / `mcp` / `skills`（順固定） |
| **Documentation** | `docs/` 配下の他すべて（上記以外） |
| **UI Components** | `ui/Xxx.mdx`（`ui/examples/` と `ui/DummyText` を除く） |
| **Optional** | `ui/examples/*` / `ui/DummyText` / `property-class/*` |

### ソート順

- **Getting Started**: `GS_ORDER` の固定順（学習導線）
- それ以外: `title` の昇順

### URL 生成（`toUrl()`）

llms.txt の慣習に従い、HTML ページではなく `.md` バージョンを指す。

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


## 4. `vercel.json`

`*.md` パスに `X-Robots-Tag: noindex` ヘッダーを付与し、検索エンジンへのインデックスを抑止する（AI 向けクロールは許容、検索結果には載せない方針）。


## 現在の出力（PR #331 時点）

- 194 件の `.md` ファイル（各ファイル冒頭に YAML frontmatter 付与）
- `dist/llms.txt` 76 エントリ（4 セクション）
- スキップ 2 件（`/ui/` / `/en/ui/` のインデックスページ — `data-pagefind-body` 不在のため意図通り）


## 関連ファイル

```
apps/docs/src/integrations/docs-md/
├── index.ts                  # integration 本体（フック登録 / ページ走査）
├── convert-html-to-md.ts     # HTML → MD 変換パイプライン
├── build-llms-txt.ts         # llms.txt 生成
├── rehype-strip-noise.ts     # ノイズ DOM 除去
├── rehype-preview.ts         # プレビュー UI 除去
├── rehype-code-language.ts   # コード言語名の転写
├── rehype-callouts.ts        # callout → GFM Alert
├── rehype-docs-link.ts       # c--docsLink の中身をタイトルのみに畳み込み
├── rehype-extract-meta.ts    # <head> メタ抽出
├── rehype-absolute-urls.ts   # ルート相対 URL → 絶対 URL
└── util.ts                   # 共通ユーティリティ
```
