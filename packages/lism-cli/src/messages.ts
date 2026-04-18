/**
 * CLI 表示用のメッセージ辞書（ja / en）。
 *
 * 命名規則:
 *   - `cli.*`    … commander の description / argument / option
 *   - `create.*` … `lism create` サブコマンド
 *   - `ui.*`     … `lism ui` 配下
 *   - `skill.*`  … `lism skill` 配下
 *   - `config.*` … lism.config.* まわりのエラー・警告
 *   - `common.*` … 汎用
 *
 * プレースホルダは `{name}` 形式（`t()` の `vars` で置換）。
 */

interface MessageEntry {
  ja: string;
  en: string;
}

export const messages = {
  // ---------------------------------------------------------------------------
  // Commander description / arguments / options
  // ---------------------------------------------------------------------------
  'cli.description': {
    ja: 'Lism CSS / UI 向け CLI',
    en: 'CLI for Lism CSS / UI',
  },
  'cli.opt.lang': {
    ja: 'CLI の表示言語を指定（ja | en）',
    en: 'Display language for the CLI (ja | en)',
  },
  'create-lism.opt.help': {
    ja: 'ヘルプを表示',
    en: 'Show help',
  },

  // create
  'cli.create.description': {
    ja: 'examples テンプレートから新規プロジェクトを生成する',
    en: 'Create a new project from an examples template',
  },
  'cli.create.arg.targetDir': {
    ja: '出力先ディレクトリ',
    en: 'Target directory',
  },
  'cli.create.opt.template': {
    ja: '使用するテンプレート名（例: astro-minimal）',
    en: 'Template name to use (e.g. astro-minimal)',
  },
  'cli.create.opt.force': {
    ja: '既存ディレクトリを強制上書き',
    en: 'Overwrite existing directory',
  },

  // ui
  'cli.ui.description': {
    ja: 'Lism UI コンポーネントの追加・管理',
    en: 'Manage Lism UI components',
  },
  'cli.ui.init.description': {
    ja: 'lism.config.js の cli セクションを生成する',
    en: 'Generate the cli section of lism.config.js',
  },
  'cli.ui.init.opt.framework': {
    ja: 'フレームワーク',
    en: 'Framework',
  },
  'cli.ui.init.opt.componentsDir': {
    ja: 'コンポーネントの出力先ディレクトリ',
    en: 'Output directory for components',
  },
  'cli.ui.init.opt.helperDir': {
    ja: 'helper の出力先ディレクトリ',
    en: 'Output directory for helpers',
  },
  'cli.ui.init.opt.force': {
    ja: '既存の cli セクションを上書き',
    en: 'Overwrite the existing cli section',
  },
  'cli.ui.add.description': {
    ja: 'コンポーネントを追加する',
    en: 'Add components',
  },
  'cli.ui.add.arg.names': {
    ja: '追加するコンポーネント名',
    en: 'Component names to add',
  },
  'cli.ui.add.opt.overwrite': {
    ja: '既存ファイルを確認なしで上書き',
    en: 'Overwrite existing files without confirmation',
  },
  'cli.ui.add.opt.all': {
    ja: '全コンポーネントを追加',
    en: 'Add all components',
  },
  'cli.ui.list.description': {
    ja: '利用可能なコンポーネント一覧を表示する',
    en: 'List available components',
  },
  'cli.ui.opt.ref': {
    ja: '取得元の Git ref（ブランチ / タグ / コミット）',
    en: 'Git ref to fetch from (branch / tag / commit)',
  },

  // skill
  'cli.skill.description': {
    ja: 'AI エージェント向けスキル（SKILL.md）の配置と管理',
    en: 'Manage SKILL.md files for AI agents',
  },
  'cli.skill.add.description': {
    ja: 'スキルを配置する',
    en: 'Deploy skills',
  },
  'cli.skill.add.opt.overwrite': {
    ja: '確認なしで上書き',
    en: 'Overwrite without confirmation',
  },
  'cli.skill.check.description': {
    ja: '配置済みスキルとリモートの差分を確認する',
    en: 'Show the diff between installed skills and the remote',
  },
  'cli.skill.check.opt.verbose': {
    ja: 'ファイル単位の差分を表示',
    en: 'Show per-file diffs',
  },
  'cli.skill.update.description': {
    ja: '配置済みスキルを最新版で上書きする（--overwrite 同等）',
    en: 'Overwrite installed skills with the latest version (same as --overwrite)',
  },
  'cli.skill.opt.ref': {
    ja: 'GitHub の取得元 ref（ブランチ／タグ／コミット）',
    en: 'Git ref to fetch from on GitHub (branch / tag / commit)',
  },
  'cli.skill.opt.all': {
    ja: '全ツールに配置',
    en: 'Deploy to all tools',
  },
  'cli.skill.opt.toolPath': {
    ja: '{path} に配置',
    en: 'Deploy to {path}',
  },

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  'create.templateNotFound': {
    ja: 'テンプレート "{name}" は見つかりません。利用可能: {list}',
    en: 'Template "{name}" not found. Available: {list}',
  },
  'create.promptSelectTemplate': {
    ja: 'テンプレートを選択してください:',
    en: 'Select a template:',
  },
  'create.promptTargetDir': {
    ja: '出力先ディレクトリ:',
    en: 'Target directory:',
  },
  'create.confirmOverwrite': {
    ja: '{dir} は既に存在し、空ではありません。上書きしますか？',
    en: '{dir} already exists and is not empty. Overwrite?',
  },
  'create.aborted': {
    ja: '中断しました。',
    en: 'Aborted.',
  },
  'create.fetching': {
    ja: 'テンプレート "{name}" を取得中（ref: {ref}）...',
    en: 'Fetching template "{name}" (ref: {ref})...',
  },
  'create.created': {
    ja: '{dir} にプロジェクトを生成しました。',
    en: 'Generated project at {dir}.',
  },
  'create.nextSteps': {
    ja: '次のコマンドで開発を開始できます:',
    en: 'Next steps:',
  },
  'create.workspaceReplaced': {
    ja: '  package.json の workspace:* を ^{version} に置換しました。',
    en: '  Replaced workspace:* in package.json with ^{version}.',
  },
  'create.workspaceFailed': {
    ja: 'package.json の書き換えに失敗しました: {reason}',
    en: 'Failed to rewrite package.json: {reason}',
  },

  // ---------------------------------------------------------------------------
  // ui
  // ---------------------------------------------------------------------------
  // ui add
  'ui.add.noConfig': {
    ja: 'lism.config.js が見つかりません。セットアップを開始します...\n',
    en: 'lism.config.js not found. Starting setup...\n',
  },
  'ui.add.catalogFailed': {
    ja: 'カタログの取得に失敗しました{refInfo}: {reason}',
    en: 'Failed to fetch catalog{refInfo}: {reason}',
  },
  'ui.add.addingAll': {
    ja: '全 {count} コンポーネントを追加します...',
    en: 'Adding all {count} components...',
  },
  'ui.add.specifyName': {
    ja: '追加するコンポーネント名を指定してください。',
    en: 'Specify component names to add.',
  },
  'ui.add.notFound': {
    ja: '見つからないコンポーネント: {list}',
    en: 'Components not found: {list}',
  },
  'ui.add.componentFetchFailed': {
    ja: '"{name}" の取得に失敗しました: {reason}',
    en: 'Failed to fetch "{name}": {reason}',
  },
  'ui.add.someFailed': {
    ja: '一部のコンポーネント / helper の追加に失敗しました。',
    en: 'Some components / helpers failed to be added.',
  },
  'ui.add.promptOverwritePolicy': {
    ja: '既存ファイルの上書き方針を選択してください:',
    en: 'Select overwrite policy for existing files:',
  },
  'ui.add.policyAll': {
    ja: '全て上書き',
    en: 'Overwrite all',
  },
  'ui.add.policyNone': {
    ja: '全てスキップ',
    en: 'Skip all',
  },
  'ui.add.policyPerComponent': {
    ja: 'コンポーネントごとに確認',
    en: 'Ask per component',
  },
  'ui.add.created': {
    ja: '  作成: {path}',
    en: '  Created: {path}',
  },
  'ui.add.deploying': {
    ja: '{name} を展開中...',
    en: 'Deploying {name}...',
  },
  'ui.add.confirmOverwriteComponent': {
    ja: '{name} は既に存在します。上書きしますか？',
    en: '{name} already exists. Overwrite?',
  },
  'ui.add.skippedComponent': {
    ja: '  スキップ: {name}',
    en: '  Skipped: {name}',
  },
  'ui.add.helperFetchFailed': {
    ja: '  helper "{name}" の取得に失敗しました: {reason}',
    en: '  Failed to fetch helper "{name}": {reason}',
  },
  'ui.add.confirmOverwriteFile': {
    ja: '{path} は既に存在します。上書きしますか？',
    en: '{path} already exists. Overwrite?',
  },
  'ui.add.skippedFile': {
    ja: '  スキップ: {path}',
    en: '  Skipped: {path}',
  },

  // ui init
  'ui.init.promptFramework': {
    ja: 'フレームワークを選択してください:',
    en: 'Select a framework:',
  },
  'ui.init.promptComponentsDir': {
    ja: 'コンポーネントの出力先ディレクトリ:',
    en: 'Output directory for components:',
  },
  'ui.init.promptHelperDir': {
    ja: 'helper の出力先ディレクトリ:',
    en: 'Output directory for helpers:',
  },
  'ui.init.patchedUpdate': {
    ja: '{path} に cli セクションを更新しました。',
    en: 'Updated the cli section in {path}.',
  },
  'ui.init.patchedAdd': {
    ja: '{path} に cli セクションを追記しました。',
    en: 'Added the cli section to {path}.',
  },
  'ui.init.notPatched': {
    ja: '{path} に既に cli セクションが含まれているか、export default が検出できませんでした。手動で追記してください。',
    en: 'Either {path} already contains a cli section or no export default was detected. Please add it manually.',
  },
  'ui.init.created': {
    ja: '{path} を作成しました。',
    en: 'Created {path}.',
  },
  'ui.init.legacyDetected': {
    ja: '{filename} を検出しました。lism.config.js へ移行します。古いファイルは後で削除してください。',
    en: 'Detected {filename}. Migrating to lism.config.js. Please remove the old file afterwards.',
  },
  'ui.init.alreadyExists': {
    ja: '{filename} には既に cli セクションが設定されています。上書きするには --force を指定してください。',
    en: '{filename} already has a cli section. Use --force to overwrite.',
  },
  'ui.init.willOverwrite': {
    ja: '{filename} の既存の cli セクションを上書きします。',
    en: 'Overwriting the existing cli section in {filename}.',
  },

  // ui list
  'ui.list.fetching': {
    ja: 'コンポーネント一覧を取得中...',
    en: 'Fetching components list...',
  },
  'ui.list.header': {
    ja: 'コンポーネント:',
    en: 'Components:',
  },
  'ui.list.total': {
    ja: '合計: {count} コンポーネント',
    en: 'Total: {count} components',
  },

  // ---------------------------------------------------------------------------
  // skill
  // ---------------------------------------------------------------------------
  // skill add
  'skill.add.detected': {
    ja: '検出した AI ツール: {list}',
    en: 'Detected AI tools: {list}',
  },
  'skill.add.promptTools': {
    ja: '配置先のツールを選択してください（スペースで選択、Enter で確定）:',
    en: 'Select target tools (Space to select, Enter to confirm):',
  },
  'skill.add.noTargets': {
    ja: '配置先が選択されませんでした。',
    en: 'No target tools were selected.',
  },
  'skill.add.fetching': {
    ja: 'スキルを取得中（ref: {ref}）...',
    en: 'Fetching skills (ref: {ref})...',
  },
  'skill.add.skippedSame': {
    ja: '  スキップ（差分なし）: {label}',
    en: '  Skipped (no changes): {label}',
  },
  'skill.add.hasDiff': {
    ja: '  {label} に差分があります:',
    en: '  {label} has changes:',
  },
  'skill.add.modifiedFiles': {
    ja: '    変更: {count} ファイル',
    en: '    Modified: {count} files',
  },
  'skill.add.addedFiles': {
    ja: '    追加: {count} ファイル',
    en: '    Added: {count} files',
  },
  'skill.add.localOnlyFiles': {
    ja: '    削除: {count} ファイル（ローカルのみに存在、上書き時に削除されます）',
    en: '    Deleted: {count} files (local-only, will be removed on overwrite)',
  },
  'skill.add.confirmOverwrite': {
    ja: '{path} を上書きしますか？',
    en: 'Overwrite {path}?',
  },
  'skill.add.skippedTool': {
    ja: '  スキップ: {tool}',
    en: '  Skipped: {tool}',
  },
  'skill.add.deployed': {
    ja: '  配置: {tool} → {path}',
    en: '  Deployed: {tool} → {path}',
  },

  // skill check
  'skill.check.noneInstalled': {
    ja: 'インストール済みのスキルは見つかりませんでした。`lism skill add` で配置できます。',
    en: 'No installed skills found. Run `lism skill add` to deploy them.',
  },
  'skill.check.fetching': {
    ja: 'リモートスキルを取得中（ref: {ref}）...',
    en: 'Fetching remote skills (ref: {ref})...',
  },
  'skill.check.upToDate': {
    ja: '  ✓ {label}  (最新)',
    en: '  ✓ {label}  (up to date)',
  },
  'skill.check.allLatest': {
    ja: 'すべてのスキルが最新です。',
    en: 'All skills are up to date.',
  },
  'skill.check.outdated': {
    ja: '{count} 件のツールに差分があります。`lism skill update` で最新に更新できます。',
    en: '{count} tools have changes. Run `lism skill update` to update them.',
  },
  'skill.check.diffModified': {
    ja: '変更 {count}',
    en: 'modified {count}',
  },
  'skill.check.diffAdded': {
    ja: '追加 {count}',
    en: 'added {count}',
  },
  'skill.check.diffDeleted': {
    ja: '削除 {count}',
    en: 'deleted {count}',
  },

  // ---------------------------------------------------------------------------
  // config
  // ---------------------------------------------------------------------------
  'config.legacyWarning': {
    ja: '[deprecated] {filename} は廃止予定です。"lism ui init" で lism.config.js へ移行してください。',
    en: '[deprecated] {filename} is deprecated. Run "lism ui init" to migrate to lism.config.js.',
  },
  'config.notFound': {
    ja: 'lism.config.js / lism.config.mjs / lism-ui.json のいずれも見つかりません。',
    en: 'None of lism.config.js / lism.config.mjs / lism-ui.json were found.',
  },
  'config.cliSectionMissing': {
    ja: '{filename} から CLI 設定（cli キー）を読み込めませんでした。',
    en: 'Failed to read the CLI config (cli key) from {filename}.',
  },
  'config.invalidFramework': {
    ja: 'cli.framework は "react" または "astro" を指定してください。',
    en: 'cli.framework must be "react" or "astro".',
  },
  'config.invalidComponentsDir': {
    ja: 'cli.componentsDir は文字列で指定してください。',
    en: 'cli.componentsDir must be a string.',
  },
  'config.invalidHelperDir': {
    ja: 'cli.helperDir は文字列で指定してください。',
    en: 'cli.helperDir must be a string.',
  },
  'config.loadFailed': {
    ja: '{path} を読み込めませんでした（構文エラー等）。修正してから再実行してください: {reason}',
    en: 'Failed to load {path} (syntax error, etc). Please fix it and retry: {reason}',
  },

  // ---------------------------------------------------------------------------
  // common
  // ---------------------------------------------------------------------------
  'common.done': {
    ja: '完了しました。',
    en: 'Done.',
  },
} as const satisfies Record<string, MessageEntry>;

export type MessageKey = keyof typeof messages;
