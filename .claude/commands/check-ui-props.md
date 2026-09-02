---
description: lism-ui の React / Astro コンポーネントで初期 props が揃っているかをチェックする
---

lism-ui の各コンポーネントについて、React 版と Astro 版のサブコンポーネントの既定 props（初期値）が揃っているかを検証し、差分を報告する。修正はユーザーの許可を得てから行う。

## 対象

- `$ARGUMENTS` でコンポーネント名の指定あり（カンマ区切り可）: そのコンポーネントのみ
- 未指定: `packages/lism-ui/src/components/` 直下の全ディレクトリ
- `react/index.ts` と `astro/index.ts` の両方があるコンポーネントだけ検証する。片側だけのものはレポート末尾に列挙する

## 手順

1. ペアリング: `react/` と `astro/` の同名ファイルを組にする（`{Name}.tsx` ↔ `{Name}.astro`）。
   - 対象は、コンポーネント関数を export する `.tsx` / `.jsx` と `.astro` だけ。default export か named export かは問わない
   - `index.ts`・`context.ts`・`*.test.*`・その他の `.ts` / `.js` helper は除外し、レポートにも載せない
   - 除外後に片側にしかないファイルは「構造不一致」として報告する
2. 既定値の抽出: 各ペアから次を読み取る。
   - 関数引数の既定値（React: `function Foo({ isOpen = false })`、Astro: `const { isOpen = false } = Astro.props`）
   - ルート要素（`<Lism>` 等）に渡す静的 props（`set="plain"`、`layout="flex"` 等）
   - className のベース値（`b--*`）
   - 条件分岐で決まる既定値（例: `as={props.href ? 'a' : 'span'}`）
   - コンポーネント直下の `getProps.ts` 等、共有ファイル経由の既定値はそのファイルを読む。両側が同じ共有ファイルを使っていれば一致とみなす
   - 対象外: TypeScript の型定義、描画結果に影響しない内部ロジック、既定値を持たない props、コメント・空白・import 順
3. 差分の検出: 片側にしかない prop、値が違う prop、引数の初期値のズレ、分岐ロジックのズレ。属性の記述順・`hidden` と `hidden={true}` の違い・空白は差分にしない。
4. 下記フォーマットでレポートを出す。差分は全件列挙する。意図的と思われる差分も挙げ、原因欄に「意図的な可能性」と書く。
5. 停止してユーザーに聞く: 「差分が {N} 件見つかりました。修正しますか？（全て修正 / 個別に指定 / 修正しない）」
6. 許可された差分だけ修正する。既定値の差分修正に限り、ロジックは変えない。修正後に変更ファイルを一覧し、`pnpm --filter @lism-css/ui typecheck` を通してから報告する。

## レポート形式

```markdown
## lism-ui props 一致チェック結果

### 対象: {N} コンポーネント / {M} サブコンポーネントペア

### 差分あり ⚠

#### {ComponentName} / {SubComponent}
- `packages/lism-ui/src/components/{ComponentName}/react/{SubComponent}.tsx:{line}`
- `packages/lism-ui/src/components/{ComponentName}/astro/{SubComponent}.astro:{line}`

| prop | React | Astro |
| --- | --- | --- |
| {propName} | `{value}` | `{value}` |
| ... | ... | ... |

**推定される原因**: <!-- 修正漏れ / 片方が新しい / 意図的な可能性 -->
**推奨される修正**: <!-- どちらに合わせるか。根拠も書く -->

---

### 構造不一致 ⚠（補助ファイル除外後）
- {ComponentName}: React 側のみ: {list}
- {ComponentName}: Astro 側のみ: {list}

### 差分なし ✅
- {ComponentName} ({N} ペア)

### 検証対象外（片側のみ存在するコンポーネント）
- {ComponentName}: {react/astro}
```
