# アンチパターン辞書

AI が Lism CSS のコードを生成する際に間違いやすい記法と、その正しい書き方をカタログ化したもの。コードを書く前に該当カテゴリを確認すること。

## TOC

- [Token typo（存在しない値）](#token-typo存在しない値)
- [Prop 型ミス](#prop-型ミス)
- [レイアウト選択ミス](#レイアウト選択ミス)
- [レスポンシブ抜け](#レスポンシブ抜け)

---

## Token typo（存在しない値）

トークン値は厳密に定義されている。一般的な命名（`primary` / `large` / 連番数値等）は採用していない。値の正確な一覧は [tokens.md](./tokens.md) を参照。

### カラー

| NG | OK | 理由 |
|---|---|---|
| `bgc="primary"` | `bgc="brand"` | セマンティックカラーに `primary` は無い。ブランド色は `brand` |
| `bgc="secondary"` | `bgc="base-2"` | 代替背景色は `base-2`（`base-3` 等も無い） |
| `c="muted"` | `c="text-2"` | 補助テキスト色は `text-2` |
| `bgc="danger"` | `bgc="red"` | パレットカラーから選ぶ（`red` / `orange` 等） |

- セマンティックカラー: `base` / `base-2` / `text` / `text-2` / `divider` / `link` / `brand` / `accent`
- パレットカラー: `red` / `blue` / `green` / `yellow` / `purple` / `orange` / `pink` / `gray` / `white` / `black`

### スペース（`p` / `m` / `g` 等）

| NG | OK | 理由 |
|---|---|---|
| `p="8"` | `p="10"` | スペーストークンはフィボナッチ系（`5/10/15/20/30/40/50/60/70/80`）。連番値は存在しない |
| `g="6"` | `g="5"` | 同上 |
| `m="100"` | `m="80"` | 上限は `80` |

### フォントサイズ（`fz`）

| NG | OK | 理由 |
|---|---|---|
| `fz="14"` | `fz="s"` | `fz` は文字列キー（数値は不可） |
| `fz="large"` | `fz="l"` | 略号は `s` / `m` / `l` / `xl` … |
| `fz="medium"` | `fz="m"` | 同上 |

トークン: `root` / `base` / `2xs` / `xs` / `s` / `m` / `l` / `xl` / `2xl` / `3xl` / `4xl` / `5xl`

### 角丸 / 影

| NG | OK | 理由 |
|---|---|---|
| `bdrs="5"` | `bdrs="10"` | 角丸トークンは `10` / `20` / `30` / `40` / `99` / `inner` |
| `bxsh="15"` | `bxsh="20"` | 影トークンは `10` / `20` / `30` / `40` / `50` |

---

## Prop 型ミス

### Heading の `level` は文字列

| NG | OK | 理由 |
|---|---|---|
| `<Heading level={3}>` | `<Heading level="3">` | `level` は `'1'` 〜 `'6'` の文字列 union 型 |

### `hov` は値ではなくクラス省略名

| NG | OK | 理由 |
|---|---|---|
| `hov="shadow"` | `hov="-bxsh"` | Lism の省略名は `bxsh`（box-shadow） |
| `hov="fade"` | `hov="-o"` | 透明度を変える hover は `-hov:-o`（デフォルト値は `var(--o--p)`） |

### レスポンシブ値は配列 or オブジェクト

| NG | OK | 理由 |
|---|---|---|
| `<Columns cols="1,2,3">` | `<Columns cols={[1, 2, 3]}>` | レスポンシブは配列 or `{ base, sm, md }` |
| `<Box p="20 30 40">` | `<Box p={[20, 30, 40]}>` | 同上 |
| `<Box p={{ default: 20 }}>` | `<Box p={{ base: 20 }}>` | オブジェクト形式のキーは `base` / `sm` / `md`（`default` は無い） |

---

## レイアウト選択ミス

詳細な選択基準は [primitive-class.md](./primitive-class.md#カラムレイアウト-primitive-の使い分けガイド) の使い分けガイドを参照。

### Grid 直書き vs Columns

| NG | OK | 理由 |
|---|---|---|
| `<Grid gtc="repeat(3, 1fr)">` | `<Columns cols={3}>` | 等幅 N 列は Columns で宣言的に書く |
| `<Grid gtc={['1fr', '1fr 1fr', '1fr 1fr 1fr']}>` | `<Columns cols={[1, 2, 3]}>` | BP 切替も Columns のほうが簡潔 |

### コンテンツ幅のハードコード

| NG | OK | 理由 |
|---|---|---|
| `style={{ maxWidth: '1200px' }}` | `<Box max-sz="container">` | サイズトークン（`xs` / `s` / `m` / `l` / `xl` / `container`）を活用 |
| `style={{ maxWidth: '800px' }}` | `<Box max-sz="m">` | 同上 |

### サイドバー型レイアウト

| NG | OK | 理由 |
|---|---|---|
| `<Grid gtc="1fr 240px">` で固定 | `<WithSide sideW="240px">` | コンテンツ幅で自動切替したいなら WithSide |
| `<Flex>` で 2 カラム強制横並び | `<WithSide>` | 縦並びへの切替が必要なら WithSide |

---

## レスポンシブ抜け

### `is--container` 祖先なしで BP 値を使用

レスポンシブ値（配列・オブジェクト・`-{prop}_{bp}` クラス）は `@container` クエリで発火するため、祖先要素のいずれかに `is--container`（コンポーネントなら `isContainer` prop）が必須。

```jsx
// NG: container 祖先がないので sm/md 値が発火しない
<div>
  <Box p={[20, 30, 40]}>...</Box>
</div>

// OK: 祖先に isContainer
<Stack isContainer>
  <Box p={[20, 30, 40]}>...</Box>
</Stack>
```

### BP 専用クラスをベース値なしで使う

| NG | OK | 理由 |
|---|---|---|
| `<div class="-p_sm" style="--p_sm: var(--s30)">` | `<div class="-p:20 -p_sm" style="--p_sm: var(--s30)">` | BP 以下では値が空になるため、ベースクラス `-{prop}:{value}` も必要 |

### ブレイクポイントの誤用

Lism CSS の標準出力で有効な BP は `sm: 480px` / `md: 800px` まで。`lg` 以降を使う場合は SCSS 設定で出力範囲を拡張する必要がある。`xs` は BP キーとして存在しない。

| NG | OK | 理由 |
|---|---|---|
| `<Box p={{ xs: 10, sm: 20 }}>` | `<Box p={{ base: 10, sm: 20 }}>` | デフォルトは `base`（`xs` キーは無い） |
| `cols={[1, 2, 3, 4]}` | `cols={[1, 2, 3]}` | 標準出力では `[base, sm, md]` までが有効。`lg` 以降は SCSS 設定が必要 |
