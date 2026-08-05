/**
 * `dev` / `check` が起動時に出す診断メッセージ。
 *
 * 契約違反（ユーザーが直せるもの）はエラーで止めるが、ここで扱うのは
 * 「CLI 自身のインストールが壊れている」類の状況。止めはせず警告だけ出す。
 */
import pc from 'picocolors';

/**
 * 標準パッケージが見つからなかった場合に警告する。
 *
 * 欠けたまま起動すると、そのパッケージの import だけが「許可されていない」という
 * 分かりにくい失敗になるため、先に本当の原因（同梱依存の欠落）を伝える。
 * サマリ等の通常出力（stdout）と混ざらないよう標準エラー出力へ出す。
 */
export function warnMissingStandardPackages(missingPackages: readonly string[]): void {
  if (missingPackages.length === 0) return;

  const names = missingPackages.map((name) => `"${name}"`).join(', ');
  console.error(
    pc.yellow(
      `[lism-mockup] Standard package(s) not found in the @lism-css/mockup install: ${names}. ` +
        `Imports of these packages will be rejected. Reinstall @lism-css/mockup to fix it.`
    )
  );
}
