/**
 * 現在の CLI 実行コンテキストを判定し、ユーザーに提示すべき起動コマンドを返す。
 *
 * - ローカル / グローバル install の bin 経由 → `lism`
 * - `npx` / `pnpm dlx` / `yarn dlx` / `bunx` 等の一時実行 → 対応する実行コマンド
 *
 * issue #328:
 *   `npx lism-cli skill check` から呼ばれた際にメッセージとして `lism skill update`
 *   を案内していたが、`lism` というパッケージは存在しないため `npx lism` / `npx lism update`
 *   は解決に失敗していた。実行形態に応じた正しいコマンドを提示する必要があったため、
 *   `process.argv[1]` と `npm_config_user_agent` から起動経路を推定する。
 */
export function getInvokeCommand(): string {
  const scriptPath = process.argv[1] ?? '';
  const userAgent = process.env.npm_config_user_agent ?? '';

  // npx / dlx / bunx のキャッシュディレクトリ配下から起動されているか
  // （パス区切りは macOS/Linux の `/` と Windows の `\` の両方を吸収）
  const inDlxCache =
    /[\\/]_npx[\\/]/.test(scriptPath) || // npm の npx（~/.npm/_npx, %LocalAppData%\npm-cache\_npx）
    /[\\/]dlx-[^\\/]+[\\/]/.test(scriptPath) || // pnpm dlx（<store>/dlx-xxxx/...）
    /[\\/]\.yarn[\\/]berry[\\/]cache[\\/]/.test(scriptPath) || // yarn berry dlx
    /[\\/]\.bun[\\/]install[\\/]cache[\\/]/.test(scriptPath); // bunx

  if (!inDlxCache) {
    // ローカル node_modules の bin / グローバル install の bin からの起動。
    // この場合は `lism` バイナリが PATH 上にあるか相対起動で解決できる。
    return 'lism';
  }

  // 一時実行系。npm_config_user_agent はどの PM も OS 問わず設定する。
  if (userAgent.startsWith('pnpm/')) return 'pnpm dlx lism-cli';
  if (userAgent.startsWith('yarn/')) return 'yarn dlx lism-cli';
  if (userAgent.startsWith('bun/')) return 'bunx lism-cli';
  return 'npx lism-cli';
}
