# create-lism

[Lism CSS](https://lism-css.com) のスターターテンプレートから新規プロジェクトを生成する CLI ラッパーです。`pnpm create lism` / `npm create lism@latest` から呼び出せます。

内部ロジックは [`lism-cli`](https://www.npmjs.com/package/lism-cli) の `lism create` と共通です（バンドル済み）。

## 使い方

```bash
# 対話モード
pnpm create lism

# テンプレート名と出力先を指定
pnpm create lism --template minimal-astro ./my-app

# npm
npm create lism@latest -- --template minimal-astro my-app

# yarn
yarn create lism --template minimal-astro my-app
```

## オプション

| オプション | 説明 |
|-----------|------|
| `-t, --template <name>` | 使用するテンプレート名（例: `minimal-astro`） |
| `-f, --force` | 既存ディレクトリを確認なしで強制上書き |
| `-h, --help` | ヘルプ表示 |

## 利用可能なテンプレート

| 名前 | 説明 |
|------|------|
| `minimal-astro` | Astro ベースの最小構成 |
| `blog-astro-simple` | タグのみのシンプルな Astro ブログ |
| `blog-astro-full` | カテゴリ・目次つきの Astro ブログ |

テンプレートは [`examples/`](https://github.com/lism-css/lism-css/tree/main/examples) 配下のカテゴリ別ディレクトリに順次追加される予定です。

## 補足

- 生成されたプロジェクトの `package.json` に含まれる `lism-css: "workspace:*"` は、ダウンロード時点の最新公開バージョン（`^0.14.0` 等）に自動で置換されます。
- 生成後、`cd <dir> && npm install` で依存を解決してください。

## License

MIT
