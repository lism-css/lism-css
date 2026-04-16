---
description: lism-ui の React / Astro コンポーネントで初期 props が揃っているかをチェックする
---

`packages/lism-ui/src/components/` 配下の全コンポーネントについて、React 版と Astro 版のサブコンポーネントに与えられているデフォルト props（既定値）が揃っているかを AI で検証する。差分が見つかった場合は **一旦報告のみ** 行い、ユーザーに修正許可を得てから実際の修正に移る。

## 引数

`$ARGUMENTS` で対象コンポーネントを絞り込める（任意）。省略時は lism-ui 全体を対象とする。

```
/check-ui-props                 # 全コンポーネントを検証
/check-ui-props Accordion       # Accordion のみ
/check-ui-props Accordion,Tabs  # 複数指定（カンマ区切り）
```

## 前提

- lism-ui のコンポーネントは `packages/lism-ui/src/components/{Name}/` 配下に配置され、`react/` と `astro/` にそれぞれサブコンポーネントのファイルが並ぶ（同じファイル名で 1:1 対応する設計）。
- `react/` 側はサブコンポーネントごとに `Root.tsx` / `Item.tsx` / ... のように分割されている。同様に `astro/` 側も `Root.astro` / `Item.astro` / ... と並ぶ。
- React では JSX の属性や関数引数のデフォルト値として、Astro では `Astro.props` の分割代入のデフォルト値や `<Lism>` 等への属性として初期 props を渡す。

## スコープ

### チェック対象

各サブコンポーネントで **コード内に直接書かれているデフォルト値** を対象とする:

1. **関数引数のデフォルト値**  
   React: `function Foo({ isOpen = false }) {}`  
   Astro: `const { isOpen = false } = Astro.props`
2. **出力要素に渡されている静的 props**  
   - `set="plain"` / `layout="flex"` / `g="10"` / `ai="center"` 等、プリミティブ値として書かれている属性
   - `className` のベース値（例: `c--accordion_button`）
3. **条件分岐で決まるデフォルト**  
   例: `as={props.href ? 'a' : 'span'}` のような、props の有無で決まる初期値

### チェック対象外

- TypeScript の型定義（Astro 側と体系が違うため）
- コンポーネント内部の実装ロジック（純粋なレンダリング結果に影響しない部分）
- ユーザー側から上書き可能だがデフォルト値を持たない props（`children` 等）
- コメント・空白・import 順など表層的な差分

## 実行手順

### 1. 対象コンポーネントの列挙

引数が指定されていればそれを使い、省略されていれば `packages/lism-ui/src/components/` 直下のディレクトリを全列挙する。各コンポーネントについて以下を確認:

- `react/index.ts` が存在するか
- `astro/index.ts` が存在するか
- `react/` と `astro/` の両方にサブコンポーネントファイルがあるか

片方しか存在しないコンポーネント（React 版のみ、または Astro 版のみ）は検証対象外とし、レポート末尾に一覧で示す。

### 2. サブコンポーネントのペアリング

各コンポーネントで `react/` と `astro/` のファイル名を突き合わせ、同名のペアを作る。  
例: `Accordion/react/Button.tsx` ↔ `Accordion/astro/Button.astro`

#### 対象ファイルの判定

以下は **UI コンポーネントではない補助ファイル** として検証対象外とし、ペアリングの前に静かに除外する（レポートにも載せない）:

- `index.ts` / `index.js` — エクスポート集約
- `context.ts` / `context.tsx` — React Context 定義（例: `Accordion/react/context.ts`）
- その他、**デフォルト export が React/Astro コンポーネントではない** ファイル（例: `Tabs/astro/transformTabitems.ts`）

判定基準:

- React 側 (`.tsx` / `.jsx`): `export default function` が JSX を返すコンポーネントであること。Context/hooks/純粋な型定義ファイルは除外。
- Astro 側 (`.astro`): `.astro` 拡張子を持ちテンプレート部を含むファイルであること。`.ts` / `.js` の helper は除外。

判定に迷う場合はファイル冒頭を読み、コンポーネント定義でなければスキップする。

#### ペアリング

除外後に残ったファイル同士でペアを作る。片方にしか存在しないサブコンポーネントは **構造不一致** として単独で報告する（補助ファイル除外後の判定であることをレポートに明記）。

### 3. デフォルト値の抽出

各ペアでファイルを読み取り、以下を抽出する:

- 関数引数のデフォルト値
- ルート要素（`<Lism>` / `<Stack>` / `<Flex>` / 素の HTML 要素）に渡されている静的 props
- className のベース値
- 条件分岐で決まるデフォルト（可読な範囲で）

### 4. 差分の検出

ペアごとにデフォルト値を比較し、**意味的な差分** を検出する:

- React のみにあり Astro にない props
- Astro のみにあり React にない props
- 両方にあるが値が異なる props
- 関数引数の初期値のズレ
- 条件分岐の分岐ロジックのズレ

**表記ゆれの扱い**: 以下は差分としない
- 属性の記述順（JSX と Astro で順序が異なるのは無視）
- `true` と属性のみ記述（`hidden` と `hidden={true}` など）
- 空白・改行

### 5. レポートの生成

以下のフォーマットで結果を提示する:

```markdown
## lism-ui props 一致チェック結果

### 対象: {N} コンポーネント / {M} サブコンポーネントペア

### 差分あり ⚠

#### {ComponentName} / {SubComponent}
- `packages/lism-ui/src/components/{ComponentName}/react/{SubComponent}.tsx:{line}`
- `packages/lism-ui/src/components/{ComponentName}/astro/{SubComponent}.astro:{line}`

| prop | React | Astro |
|---|---|---|
| {propName} | `{value}` | `{value}` |
| ... | ... | ... |

**推定される原因**: <!-- 修正漏れ / 片方が新しい / 意図的な差異 の別を推測 -->
**推奨される修正**: <!-- どちらに合わせるべきか、根拠と共に提示 -->

---

（他の差分）

### 構造不一致 ⚠
- {ComponentName}: React 側にのみ存在するサブコンポーネント: {list}
- {ComponentName}: Astro 側にのみ存在するサブコンポーネント: {list}

### 差分なし ✅
- {ComponentName} ({N} ペア)
- ...

### 検証対象外（片側のみ存在するコンポーネント）
- {ComponentName}: {react/astro}
```

### 6. 修正の実行（ユーザー承認後のみ）

レポートを提示したら、**必ず一旦作業を停止してユーザーの指示を仰ぐ**。以下のいずれかを聞く:

> 差分が {N} 件見つかりました。修正しますか？  
> - 全て修正（推奨される方向で）  
> - 個別に指定  
> - 修正しない（レポートのみ）

ユーザーから明示的に修正許可が出た場合のみ、ファイルを編集する。修正後は:

1. 変更したファイルを一覧表示
2. `pnpm --filter @lism-css/ui typecheck` で型検証
3. 問題なければユーザーに完了を報告

## 注意事項

- レポートは長くなりがちだが、省略せずに全ての差分を列挙すること（ユーザーが全体像を把握できることを優先）
- 「差分なし」のコンポーネントは 1 行でまとめてよい
- 意図的な差異と思われるもの（例: Astro にしかない `data-*` 属性で振る舞いを制御している等）も差分として挙げ、**推定される原因** 欄に「意図的な可能性」と明記する
- 本コマンドで検出した差分の実際の修正は、デフォルト値の差分修正にとどめること。ロジックそのものの変更は行わない
- `node_modules` / `dist` は読まない

## ユーザーからの補足

$ARGUMENTS
