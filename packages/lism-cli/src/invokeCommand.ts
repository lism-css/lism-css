/**
 * 起動形態（ローカル/グローバル install か、npx/dlx/bunx の一時実行か）を判定し、
 * メッセージで案内すべき実行コマンド文字列を返す。
 */
export function getInvokeCommand(): string {
  const scriptPath = process.argv[1] ?? '';
  const userAgent = process.env.npm_config_user_agent ?? '';

  const normalizedScriptPath = normalizePath(scriptPath);

  // パス区切りは macOS/Linux の `/` と Windows の `\` の両方を吸収する
  const inDlxCache =
    /\/_npx\//.test(normalizedScriptPath) ||
    /\/pnpm(?:-cache)?\/(?:[^/]+\/)*dlx-[^/]+\//.test(normalizedScriptPath) ||
    /\/\.yarn\/berry\/cache\//.test(normalizedScriptPath) ||
    /\/\.bun\/install\/cache\//.test(normalizedScriptPath);

  const inLocalDependency =
    isInProjectNodeModules(normalizedScriptPath) &&
    (/\/node_modules\/\.bin\/lism(?:\.(?:cmd|ps1))?$/.test(normalizedScriptPath) ||
      /\/node_modules\/lism-cli\/bin\/lism\.mjs$/.test(normalizedScriptPath));

  if (inDlxCache) return getDlxInvokeCommand(userAgent);
  if (inLocalDependency) return getLocalInvokeCommand(userAgent);

  return 'lism';
}

function getDlxInvokeCommand(userAgent: string): string {
  if (userAgent.startsWith('pnpm/')) return 'pnpm dlx lism-cli';
  if (userAgent.startsWith('yarn/')) return 'yarn dlx lism-cli';
  if (userAgent.startsWith('bun/')) return 'bunx lism-cli';
  return 'npx lism-cli';
}

function getLocalInvokeCommand(userAgent: string): string {
  if (userAgent.startsWith('pnpm/')) return 'pnpm exec lism';
  if (userAgent.startsWith('yarn/')) return 'yarn lism';
  if (userAgent.startsWith('bun/')) return 'bun run lism';
  return 'npx lism-cli';
}

function isInProjectNodeModules(scriptPath: string): boolean {
  let dir = normalizePath(process.cwd());

  while (dir) {
    if (scriptPath.startsWith(`${dir}/node_modules/`)) return true;

    const parent = dir.slice(0, dir.lastIndexOf('/'));
    if (parent === dir) break;
    dir = parent;
  }

  return false;
}

function normalizePath(value: string): string {
  return value.replaceAll('\\', '/').replace(/\/+$/, '');
}
