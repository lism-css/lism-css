# ルートで各パッケージでビルド確認してから

```bash
nr build
```


## lism-css

1. `/lism-css-build` コマンドで lint, test, build を順に実行
2. publish 

```bash
pnpm publish
```

##
## scoped な @lism-css/ui, @lism-css/mcp は --access public が必要

```bash
pnpm publish --access public
```

