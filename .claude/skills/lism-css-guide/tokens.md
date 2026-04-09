# デザイントークン

Lism CSS では、余白・フォントサイズ・カラーなどの主要なCSSプロパティに対してデザイントークンを定義しています。
トークン値は CSS 変数にマッピングされ、Props やユーティリティクラスから参照できます。

CSSコードを書く場合やコンポーネントのPropsに値を指定する際は、明確な意図がない限りは固定値のハードコーディングを避け、デザイントークンの値を優先して使用してください。

## TOC

- [デザイントークンの一覧](#デザイントークンの一覧)

[詳細](https://lism-css.com/docs/tokens/)

---

## デザイントークンの一覧

| カテゴリ | トークン値 | CSS変数パターン | 例 |
|---|---|---|---|
| 余白 (space) | `5`, `10`, `15`, `20`, `30`, `40`, `50`, `60`, `70`, `80` | `--s{n}` | `--s20` |
| フォントサイズ (fz) | `root`, `base`, `2xs`, `xs`, `s`, `m`, `l`, `xl`, `2xl`, `3xl`, `4xl`, `5xl` | `--fz--{key}` | `--fz--l` |
| ハーフレディング・行間 (lh/hl) | `base`, `xs`, `s`, `l` | `--hl--{key}` | `--hl--s` |
| 字間 (lts) | `base`, `s`, `l` | `--lts--{key}` | `--lts--s` |
| フォント (ff) | `base`, `accent`, `mono` | `--ff--{key}` | `--ff--mono` |
| ウェイト (fw) | `light`, `normal`, `bold` | `--fw--{key}` | `--fw--bold` |
| 透明度 (o) | `-10`, `-20`, `-30` | `--o--n{n}` | `--o--n10` |
| 角丸 (bdrs) | `10`, `20`, `30`, `40`, `99`, `inner` | `--bdrs--{key}` | `--bdrs--20` |
| 影 (bxsh) | `10`, `20`, `30`, `40` | `--bxsh--{n}` | `--bxsh--20` |
| サイズ (sz) | `xs`, `s`, `m`, `l`, `xl`, `min`, `full`, `container` | `--sz--{key}` | `--sz--l` |
| アスペクト比 (ar) | `og` | `--ar--{key}` | `--ar--og` |
| 書字方向 (writing) | `vertical` | `--writing--{key}` | `--writing--vertical` |
| フロー余白 (flow) | `s`, `l` | `--flow--{key}` | `--flow--s` |
| セマンティックカラー (c) | `base`, `base-2`, `text`, `text-2`, `divider`, `link`, `brand`, `accent` | `--{name}` | `--brand` |
| パレットカラー (palette) | `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `gray`, `white`, `black`, `keycolor` | `--{name}` | `--red` |



### カラー補足

- `c`, `bgc` 等のカラー系 Props では、セマンティックカラー → パレットカラーの順で検索される
- どちらも最終的に `var(--{name})` に変換される
- テーマカラー: `brand`, `accent`
- 背景系: `base`, `base-2`
- テキスト系: `text`, `text-2`


### トークン値の命名規則について

1. **`s`, `m`, `l`, `xl` 等のサイズ表記** — ベース値（`base` or `m`）があり、それに対する大小を表すトークン
   - `:root`/`body` にセットされている値に戻すものは `base`、そうでない中心値は `m`
2. **`10`, `20`, `30` 等の数値表記** — `0`（`none`）が基準で、段階的に値を持つトークン
3. **セマンティック名** — プロパティ固有の意味を持つ名前（例: `--ar--og`, `--ff--mono`など）
