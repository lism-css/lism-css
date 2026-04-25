/**
 * 起動形態（ローカル/グローバル install か、npx/dlx/bunx の一時実行か）を判定し、
 * メッセージで案内すべき実行コマンド文字列を返す。
 */
export function getInvokeCommand(): string {
  const scriptPath = process.argv[1] ?? '';
  const userAgent = process.env.npm_config_user_agent ?? '';

  // パス区切りは macOS/Linux の `/` と Windows の `\` の両方を吸収する
  const inDlxCache =
    /[\\/]_npx[\\/]/.test(scriptPath) ||
    /[\\/]pnpm(?:-cache)?[\\/](?:[^\\/]+[\\/])*dlx-[^\\/]+[\\/]/.test(scriptPath) ||
    /[\\/]\.yarn[\\/]berry[\\/]cache[\\/]/.test(scriptPath) ||
    /[\\/]\.bun[\\/]install[\\/]cache[\\/]/.test(scriptPath);

  if (!inDlxCache) return 'lism';

  if (userAgent.startsWith('pnpm/')) return 'pnpm dlx lism-cli';
  if (userAgent.startsWith('yarn/')) return 'yarn dlx lism-cli';
  if (userAgent.startsWith('bun/')) return 'bunx lism-cli';
  return 'npx lism-cli';
}
