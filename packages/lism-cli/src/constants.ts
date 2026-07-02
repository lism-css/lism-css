/**
 * CLI 全体で参照する内部定数を集約するファイル。
 *
 * ここに置く対象:
 * - GitHub の取得元（リポジトリ名 / raw base URL / リポジトリ内パス）
 * - npm レジストリの base URL（公開バージョン解決に使用）
 * - giget で参照する ref のデフォルト値
 *
 * 注: ユーザーが触る `lism.config.js` の設定とは別物。ユーザー設定は config.ts を参照。
 */

/** 配信元の GitHub リポジトリ（owner/repo） */
export const SOURCE_REPO = 'lism-css/lism-css';

/** raw GitHub の base URL（生ファイル fetch に使用） */
export const RAW_GITHUB_BASE = 'https://raw.githubusercontent.com';

/** npm レジストリの base URL（`lism-cli create` の workspace:* 置換時に公開最新版を解決するのに使用） */
export const NPM_REGISTRY_BASE = 'https://registry.npmjs.org';

// -----------------------------------------------------------------------------
// Default refs
//
// FIXME(マージ運用):
//   - dev ブランチへマージする直前に、各値を `'dev'` に揃えること。
//   - main ブランチへマージする直前に、各値を `'main'` に揃えること。
// -----------------------------------------------------------------------------

/** `lism-cli ui add` / `lism-cli ui list` が参照する lism-ui ソースの ref */
export const DEFAULT_UI_REF = 'main';

/** `lism-cli skill add` / `check` / `update` が参照するスキルディレクトリの ref */
export const DEFAULT_SKILL_REF = 'main';

/** `lism-cli create` が参照する templates の ref */
export const DEFAULT_TEMPLATES_REF = 'main';

// -----------------------------------------------------------------------------
// Repository internal paths
// -----------------------------------------------------------------------------

/** lism-ui のコンポーネントソース（giget で個別ディレクトリを取得） */
export const UI_COMPONENTS_PATH = 'packages/lism-ui/src/components';

/** lism-ui の helper ソース */
export const UI_HELPER_PATH = 'packages/lism-ui/src/helper';

/** lism-ui のカタログ JSON（raw GitHub から fetch） */
export const UI_REGISTRY_INDEX_PATH = 'packages/lism-ui/registry-index.json';

/** 配信元リポジトリ内で各スキルディレクトリを束ねるベースディレクトリ（実体は `skills/{name}`） */
export const SKILL_SOURCE_BASE = 'skills';

/**
 * 配布対象のスキル名レジストリ。
 *
 * 引数なしの `lism skill add` / `lism skill update` はここに並ぶ全スキルを一括導入し、
 * `lism skill check` も全スキルを対象に差分確認する。`lism skill add [name]` で個別指定も可。
 * リポジトリ内の実体は `skills/{name}`、配置先は `.{tool}/skills/{name}`。
 */
export const SKILL_NAMES = ['lism-css-guide', 'lism-css-refactor'] as const;

/** 配布対象スキル名 */
export type SkillName = (typeof SKILL_NAMES)[number];

/** templates の配置ディレクトリ */
export const TEMPLATES_PATH = 'templates';
