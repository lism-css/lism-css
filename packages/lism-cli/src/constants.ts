/**
 * CLI 全体で参照する内部定数を集約するファイル。
 *
 * ここに置く対象:
 * - GitHub の取得元（リポジトリ名 / raw base URL / リポジトリ内パス）
 * - giget で参照する ref のデフォルト値
 *
 * 注: ユーザーが触る `lism.config.js` の設定とは別物。ユーザー設定は config.ts を参照。
 */

/** 配信元の GitHub リポジトリ（owner/repo） */
export const SOURCE_REPO = 'lism-css/lism-css';

/** raw GitHub の base URL（生ファイル fetch に使用） */
export const RAW_GITHUB_BASE = 'https://raw.githubusercontent.com';

// -----------------------------------------------------------------------------
// Default refs
//
// FIXME(マージ運用):
//   - dev ブランチへマージする直前に、各値を `'dev'` に揃えること。
//   - main ブランチへマージする直前に、各値を `'main'` に揃えること。
// -----------------------------------------------------------------------------

/** `lism ui add` / `lism ui list` が参照する lism-ui ソースの ref */
export const DEFAULT_UI_REF = 'dev';

/** `lism skill add` / `check` / `update` が参照するスキルディレクトリの ref */
export const DEFAULT_SKILL_REF = 'dev';

/** `lism create` が参照する examples テンプレートの ref */
export const DEFAULT_TEMPLATES_REF = 'dev';

// -----------------------------------------------------------------------------
// Repository internal paths
// -----------------------------------------------------------------------------

/** lism-ui のコンポーネントソース（giget で個別ディレクトリを取得） */
export const UI_COMPONENTS_PATH = 'packages/lism-ui/src/components';

/** lism-ui の helper ソース */
export const UI_HELPER_PATH = 'packages/lism-ui/src/helper';

/** lism-ui のカタログ JSON（raw GitHub から fetch） */
export const UI_REGISTRY_INDEX_PATH = 'packages/lism-ui/registry-index.json';

/** スキル配信元のディレクトリ */
export const SKILL_SOURCE_PATH = 'skills/lism-css-guide';

/** examples テンプレートの配置ディレクトリ */
export const EXAMPLES_PATH = 'examples';
