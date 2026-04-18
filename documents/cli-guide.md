# Lism CLI ガイド（運営者向け）

ユーザー向けの使い方は [packages/lism-cli/README.md](../packages/lism-cli/README.md) と [apps/docs](../apps/docs/src/content/ja/installation.mdx) を見る。
ここは運営観点の差分メモ。


## 構成

| パッケージ | bin | 役割 |
|---|---|---|
| `@lism-css/cli` | `lism` | 本体（`create` / `ui` / `skill`） |
| `create-lism` | `create-lism` | `pnpm create lism` 用ラッパー。`@lism-css/cli` を **bundle で内包**（runtime 依存ナシ） |

配信元はすべて giget で `github:lism-css/lism-css/...` から直 fetch（旧 HTTP Registry / `cli.lism-css.com` は廃止）。


## 🚨 ref 切り替え（最重要）

`packages/lism-cli/src/constants.ts` の以下 3 つはブランチに合わせて手動切替:

| 定数 | dev | main |
|---|---|---|
| `DEFAULT_UI_REF` | `'dev'` | `'main'` |
| `DEFAULT_SKILL_REF` | `'dev'` | `'main'` |
| `DEFAULT_TEMPLATES_REF` | `'dev'` | `'main'` |

**dev / main マージ前に必ず grep して値を揃える。** 検証用 PR ブランチを指したまま publish すると、ブランチ削除で CLI が壊れる。


## build / publish

```bash
nr build:cli    # cli → create-lism の順（^build 依存で順序保証）
nr publish:cli  # build → @lism-css/cli publish → create-lism publish
```

- `@lism-css/cli` と `create-lism` は **同じバージョンで一緒に** publish する
- `lism create` で生成されるプロジェクトの `lism-css: workspace:*` は tsup の `define` で埋め込んだ `__LISM_CSS_VERSION__`（`packages/lism-css/package.json` の version）に置換される。**lism-css リリース後は CLI も rebuild & publish しないと新規プロジェクトが古い lism-css を引く**
- `packages/lism-ui/registry-index.json` は **commit 対象**。コンポーネント増減時は `pnpm --filter @lism-css/ui build` で再生成して commit する
- 検証目的の beta publish でも `DEFAULT_*_REF` を PR ブランチに固定しないこと（壊れる）。検証時は CLI 側の `--ref` フラグで都度指定する


## publish 前チェック

- [ ] `constants.ts` の 3 つの ref が `'main'`
- [ ] `registry-index.json` が最新
- [ ] `nr lint` / `nr typecheck` / `nr test`
- [ ] `node packages/lism-cli/bin/lism.mjs --help` でコマンド体系を目視確認


## 関連 PR

| PR | 内容 |
|---|---|
| #290 | `lism` / `create-lism` 統合、`skills/` 直下移動、`lism.config.js` 統合、react/astro 階層除去 |
| #293 | `create-lism` を bundle 自己完結型へ |
| #294 | UI 配信を giget 直 fetch へ移行、`apps/cli` 廃止 |
