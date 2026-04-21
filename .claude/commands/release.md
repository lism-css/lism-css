# Release

指定されたパッケージのバージョン更新・タグ付け・リリースノート生成・GitHub リリース作成までを一貫して行う。
npm publish とデプロイはユーザーが手動で行う。

## 引数

`$ARGUMENTS` をスペース区切りで解釈する:

- 第1引数: パッケージ識別子（`lism-css` / `lism-ui` / `lism-cli`）
- 第2引数: リリースバージョン（例: `0.10.0`）

## パッケージマッピング

| 識別子 | npm パッケージ名 | ディレクトリ | タグプレフィックス | publish コマンド |
|---|---|---|---|---|
| `lism-css` | `lism-css` | `packages/lism-css/` | `lism-css@v` | `nr publish:core` |
| `lism-ui` | `@lism-css/ui` | `packages/lism-ui/` | `lism-ui@v` | `nr publish:ui` |
| `lism-cli` | `lism-cli` + `create-lism` | `packages/lism-cli/` + `packages/create-lism/` | `lism-cli@v` | `nr publish:cli` |

### lism-cli の特別ルール

`lism-cli` は `lism-cli` と `create-lism` を **同時に同じバージョンで** publish する（`nr publish:cli` がまとめて処理する）。

- `packages/lism-cli/package.json` と `packages/create-lism/package.json` の `version` を両方更新する
- ディレクトリ判定では `packages/lism-cli/` または `packages/create-lism/` のいずれかへの変更を `lism-cli` として扱う
- **publish 前のチェック必須**: `packages/lism-cli/src/constants.ts` の `DEFAULT_UI_REF` / `DEFAULT_SKILL_REF` / `DEFAULT_TEMPLATES_REF` が `'main'` になっていることを確認する（PR ブランチや `'dev'` のままだと公開版 CLI が壊れる）
- `create-lism` 側は `lism-cli` を bundle で内包しているため、CLI 本体に依存変更があった場合も `create-lism` の `dependencies` 追従は不要

## 現在の状態

- 現在のブランチ: !`git branch --show-current`
- 既存タグ: !`git tag --list --sort=-version:refname | head -20`
- lism-css の現在バージョン: !`node -p "require('./packages/lism-css/package.json').version"`
- lism-ui の現在バージョン: !`node -p "require('./packages/lism-ui/package.json').version"`

## 手順

### 1. dev ブランチの確認

- 現在のブランチが dev であることを確認する
- dev 以外にいる場合、ユーザーに警告し「dev に切り替えますか？」と確認する
- `git pull origin dev` で最新状態にする
- 引数（パッケージ識別子、バージョン）が不足している場合はユーザーに確認する

### 2. バージョン更新

- 対象パッケージの `package.json` の version を確認する
- 引数で指定されたバージョンと異なる場合:
  - `package.json` の `"version"` フィールドを更新する
  - `git add` → `git commit -m "chore: {パッケージ識別子} v{バージョン}"`
  - ユーザーにpushしていいか確認 → `git push origin dev`
- すでに一致している場合はスキップする

### 3. 前回タグの特定

- 既存タグから、同じタグプレフィックスを持つ直前のタグを探す
- 前回タグがない場合は、リポジトリの最初のコミットからの全履歴を対象とする

### 4. 変更の分析

前回タグ（または最初のコミット）〜 dev の HEAD 間で `git log --oneline` と `git diff --stat` を取得する。

**パッケージの振り分けルール（変更ファイルのパスで判定）:**

- `packages/lism-css/` → lism-css
- `packages/lism-ui/` → lism-ui
- `apps/docs/` → Documentation（両パッケージ共通）
- その他（ルート設定ファイル等）→ Other

対象パッケージに関連する変更を中心にリリースノートを構成する。
ドキュメントサイト（`apps/docs/`）のみに関する変更（docs修正、ドキュメント同期など）はリリースノートに含めない。パッケージのコード変更を伴うコミットのみを対象とする。

### 5. リリースノートと changelog の生成

#### 5-A. GitHub リリースノート

以下のフォーマットで日本語のリリースノートを生成する:

```markdown
## What's Changed

### Features
- 変更内容の説明 (コミットハッシュ短縮形)

### Bug Fixes
- 変更内容の説明 (コミットハッシュ短縮形)

### Other
- 変更内容の説明 (コミットハッシュ短縮形)
```

**分類ルール:**

- `feat` プレフィックス、または新機能追加 → Features
- `fix` プレフィックス、またはバグ修正 → Bug Fixes
- `docs` プレフィックス → ドキュメントのみの変更は除外する
- `chore`, `refactor`, `style`, `perf`, `ci`, `build` → Other

空のカテゴリは省略する。コミットメッセージが日本語の場合はそのまま使用する。

#### 5-B. changelog エントリ

ここの changelog.mdx作成は `lism-css` と `@lism-css/ui` 更新時のみ。

リリースノートの内容をもとに、changelog.mdx 用の簡潔なエントリを日本語・英語の両方で生成する。

##### 構造ルール

**親は常に `lism-css` のリリース（H2）**。`@lism-css/ui` 等の追従パッケージは、その中に H3 (`### @lism-css/ui v.X.Y.Z`) としてネスト配置する。

- `lism-css` 本体のリリースがない場合（`@lism-css/ui` 単独リリース等）のみ、H2 `## @lism-css/ui v.X.Y.Z (YYYY.MM.DD)` で独立エントリとする
- 同日に `lism-css` と `@lism-css/ui` が両方リリースされる場合、必ず `lism-css` を親にして `@lism-css/ui` をネストする

##### テンプレート（通常リリース）

```markdown
<Divider bds="dashed" my="40" />

## lism-css v.{バージョン} (YYYY.MM.DD)

- 変更内容の簡潔な説明
- ...

### `@lism-css/ui` v.{バージョン} (YYYY.MM.DD)

- 変更内容の簡潔な説明
- ...
```

##### テンプレート（破壊的変更を含むリリース）

大きな変更やトピックがある場合は、H3 でテーマ別にセクション分けする。PR 番号があれば末尾に付与（例: `(#324)`）。

```markdown
<Divider bds="dashed" my="40" />

## lism-css v.{バージョン} (YYYY.MM.DD)

**破壊的変更**を含むリリースです。

### {トピック名} (#PR)

- ...

### {トピック名} (#PR)

- ...

### その他

- ...

### `@lism-css/ui` v.{バージョン} (YYYY.MM.DD)

**破壊的変更**を含むリリースです。

- 変更内容の簡潔な説明
- ...
```

- `@lism-css/ui` 側に大きなテーマ別変更がある場合は、H3 はコア親との階層競合を避けるため使わず、強調太字（`**テーマ名**`）でサブ見出しを立てる

##### 英語版のフレーズ対応

| 日本語 | 英語 |
|---|---|
| `**破壊的変更**を含むリリースです。` | `This release contains **breaking changes**.` |
| `### その他` | `### Other` |

##### その他のルール

- リリースノートのカテゴリ分け（Features / Bug Fixes 等）は不要。H3 セクションまたはフラットな箇条書きでまとめる
- コミットハッシュは含めない
- 日付は `YYYY.MM.DD` 形式で、当日の日付を使用する
- H2 リリース間には必ず `<Divider bds="dashed" my="40" />` を入れる
- 既存エントリのスタイル（v0.13.0 以降）を参考にする

### 6. ユーザーに確認

生成したリリースノートと changelog エントリ（ja/en）を表示し、以下を確認する:

- タグ名: `{タグプレフィックス}{バージョン}`
- GitHub リリースノートの内容
- changelog エントリの内容（日本語・英語）
- 続行してよいかの許可

ユーザーが内容を修正したい場合は、指示に従って調整する。

### 6.5. ドキュメント内のバージョン番号更新

リポジトリ全体で `{npm パッケージ名}@{旧バージョン}` を含むファイルを検索し、バージョン番号を新バージョンに更新する。

- `lism-css` の場合: `lism-css@{旧バージョン}` を検索
- `lism-ui` の場合: `@lism-css/ui@{旧バージョン}` を検索

**手順:**
1. リポジトリ全体で上記パターンを検索し、該当箇所を特定する（changelog.mdx と package.json は除外）
   - 主な対象: `apps/docs/`、`.claude/skills/`、`README.md` 等
2. 旧バージョン → 新バージョンに置換する
3. 該当箇所がない場合はスキップする

旧バージョンは、ステップ2で確認した更新前の `package.json` の version 値を使用する。

この変更はステップ7の changelog 更新と同じコミットに含める。

### 7. changelog.mdx の更新

ユーザーの承認後、以下のファイルにエントリを追記する:

- `apps/docs/src/content/ja/changelog.mdx`
- `apps/docs/src/content/en/changelog.mdx`

**追記位置:** 既存の最新エントリ（最初の `## lism-css v.` もしくは `## @lism-css/ui v.` 見出し）の直前に挿入する。挿入後、直前のエントリとの間に `<Divider bds="dashed" my="40" />` があることを確認する（なければ新エントリの末尾に追加）。

**追従パッケージのネスト処理:**

- `lism-css` 本体を先にリリース → 後から `@lism-css/ui` を追従リリースする場合、既存の `## lism-css v.X.Y.Z` エントリの末尾（最後の H3 セクションの下、かつ次の `<Divider>` の前）に `### @lism-css/ui v.X.Y.Z (YYYY.MM.DD)` をネスト追加する
- `lism-css` と `@lism-css/ui` を同時リリースする場合、一度に親 + ネスト構造で新規エントリを作成する

追記後:
1. `git add apps/docs/src/content/ja/changelog.mdx apps/docs/src/content/en/changelog.mdx`
2. `git commit -m "docs: v{バージョン} changelog 追記"`
3. ユーザーにpushしていいか確認 → `git push origin dev`

### 8. npm publish（ユーザー手動）

ユーザーに以下を案内し、完了を待つ:

```
pnpm publish を実行してください:
  {対応する publish コマンド}

完了したら教えてください。
```

### 9. デプロイ（ユーザー手動）

ユーザーに以下を案内し、完了を待つ:

```
デプロイを実行してください:
  nr deploy

完了したら教えてください。
```

### 10. main ブランチに切り替え

publish とデプロイの完了をユーザーが確認した後:

- `git checkout main && git pull origin main` で main の最新状態にする

### 11. タグ付けと GitHub リリースの作成

以下を順番に実行する:

1. `git tag {タグ名}` でタグを作成（main の HEAD に付与される）
2. `git push origin {タグ名}` でタグをプッシュ
3. `gh release create {タグ名} --title "{タグ名}" --notes "{リリースノート}"` で GitHub リリースを作成

完了後、元のブランチ（dev）に戻る。
