import { runCreate } from '@lism-css/cli';

/**
 * `pnpm create lism` / `npm create lism@latest` から呼ばれる薄いラッパー。
 * 最小限の引数パースのみ行い、本体は `@lism-css/cli` の `runCreate` に委譲する。
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let template: string | undefined;
  let targetDir: string | undefined;
  let force = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-t' || a === '--template') {
      template = args[++i];
    } else if (a === '-f' || a === '--force') {
      force = true;
    } else if (a === '-h' || a === '--help') {
      printHelp();
      return;
    } else if (!a.startsWith('-')) {
      targetDir ??= a;
    }
  }

  await runCreate({ template, targetDir, force });
}

function printHelp(): void {
  process.stdout.write(
    [
      'Usage: create-lism [targetDir] [options]',
      '',
      'Options:',
      '  -t, --template <name>   使用するテンプレート（例: astro-minimal）',
      '  -f, --force             既存ディレクトリを強制上書き',
      '  -h, --help              ヘルプを表示',
      '',
    ].join('\n')
  );
}

main().catch((err: unknown) => {
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
