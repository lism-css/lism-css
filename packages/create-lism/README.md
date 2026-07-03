# create-lism

[Lism CSS](https://lism-css.com) のスターターテンプレートから新規プロジェクトを生成するCLIラッパーです。`pnpm create lism` / `npm create lism@latest` から呼び出せます。

内部ロジックは [`lism-cli`](https://www.npmjs.com/package/lism-cli) の `lism-cli create` と共通です（バンドル済み）。

## 使い方

```bash
# 対話モード
pnpm create lism

# テンプレート名と出力先を指定
pnpm create lism --template minimal-astro ./my-app

# カテゴリ名を指定（stack 以下の選択を対話で続行）
pnpm create lism --template minimal ./my-app

# npm
npm create lism@latest -- --template minimal-astro my-app

# yarn
yarn create lism --template minimal-astro my-app

# 言語を指定（CLI 表示 + 生成テンプレートの言語）
pnpm create lism --template blog-astro-minimal --lang en ./my-blog
```

## オプション

| オプション | 説明 |
|-----------|------|
| `-t, --template <name>` | 使用するテンプレート名またはカテゴリ名（例: `minimal-astro` / `minimal`） |
| `--lang <ja\|en>` | CLIの表示言語と、生成されるテンプレート本体の言語を指定。未指定時は対話端末（TTY）で言語選択プロンプトを表示し、非対話環境では `en` にフォールバック |
| `-f, --force` | 既存ディレクトリを確認なしで強制上書き |
| `-h, --help` | ヘルプ表示 |

## 利用可能なテンプレート

| 名前 | 説明 |
|------|------|
| `minimal-astro` | Astro ベースの最小構成 |
| `minimal-vite` | Vite + React ベースの最小構成 |
| `blog-astro-minimal` | 記事一覧 / 詳細 / Tags のみの最小構成の Astro ブログ |
| `blog-astro-personal` | 個人ブログ・エッセイ向け。年月アーカイブつきの落ち着いた Astro ブログ |
| `blog-astro-techlog` | 技術ブログ向け。コードハイライト・カテゴリ・タグ・TOC・年月アーカイブ・検索を装備した Astro ブログ |
| `lp-astro-corporate` | コーポレートサイト向けの Astro ランディングページ |
| `lp-astro-interior` | インテリア・暮らし系サービス向けの Astro ランディングページ |

テンプレートは [`templates/`](https://github.com/lism-css/lism-css/tree/main/templates) 配下のカテゴリ別ディレクトリに順次追加される予定です。

## 補足

- 生成されたプロジェクトの `package.json` にある `dependencies` / `devDependencies` / `peerDependencies` 内の `"workspace:*"` 指定は、ダウンロード時点のnpmレジストリ最新公開バージョン（`^0.23.0` 等）へ自動で置換されます。レジストリへの問い合わせに失敗した場合は、CLIにビルド時点で焼き込まれたバージョンにフォールバックします。
- 生成後、`cd <dir> && npm install` で依存を解決してください。

## License

MIT
