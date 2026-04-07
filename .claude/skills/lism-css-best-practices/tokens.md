# デザイントークン

Props の値には、生のCSS値ではなくデザイントークンを優先してください。


## 余白 (SPACE)

`5`, `10`, `15`, `20`, `30`, `40`, `50`, `60`, `70`, `80`
→ CSS変数 `--s{n}` に対応（例: `--s20`）


## フォントサイズ (FONT SIZE)

`2xs`, `xs`, `s`, `m`, `l`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`
→ CSS変数 `--fz--{key}` に対応（例: `--fz--l`）


## 角丸 (BORDER RADIUS)

`10`, `20`, `30`, `40`, `99`
→ CSS変数 `--bdrs--{n}` に対応（例: `--bdrs--20`）


## 影 (BOX SHADOW)

`10`, `20`, `30`, `40`
→ CSS変数 `--bxsh--{n}` に対応（例: `--bxsh--20`）


## セマンティックカラー (COLOR)

- テーマ: `brand`, `accent`
- 背景系: `base`, `base-2`
- テキスト系: `text`, `text-2`
- その他: `divider`, `link`
→ CSS変数 `--{name}` に対応（例: `--brand`, `--text`）


## パレットカラー (PALETTE)

`red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `gray`, `white`, `black`, `keycolor`
→ CSS変数 `--{name}` に対応（例: `--red`, `--blue`）
→ Props で指定すると内部的に `var(--palette--{name})` として処理されます

詳細: https://lism-css.com/docs/tokens/
