# コマンドメモ

## publish

```
npm publish --access=public
```

## 開発時のキャッシュ削除

turbo

```
pnpm run clean
```

next.js

```
rm -rf .next/cache
```

```
rm -rf node_modules pnpm-lock.yaml
rm -rf apps/docs/node_modules
rm -rf apps/playgrounds/*/node_modules
rm -rf packages/*/node_modules
```

# Prettier と Eslint,Stylelint についてのメモ

## 現状

- コード整形は prettier が担当。
- eslint にエラー表示をしてもらう
- stylelintの自動整形はvscodeプラグインのコメント解析不具合により断念。フォーマットはprettierに任せ、Taskでlintを動かす。

## 必要な VSCode の拡張機能

- Prettier
- ESLint (ファイル開いてる時にエラー表示)

## vscode の settings

```
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"[scss]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"[astro]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	}
```

(prettierはscssも標準対応してるはずだが、明示的に書かないと動かなかった)

## モノレポにおけるlint ファイルについて

.editorconfig や lint系設定ファイルは、基本的にルートに置いておくだけでよさそう。
astro プロジェクトは prettierrc 上書きするためにそれぞれ用意したりする。

## stylelint

stylelint 16 にすると、vscodeのstylelintプラグインで自動整形させると保存するたびにバグる.
