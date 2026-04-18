import { runCreate, setLang, t } from '@lism-css/cli';

/**
 * `pnpm create lism` / `npm create lism@latest` から呼ばれる薄いラッパー。
 * 最小限の引数パースのみ行い、本体は `@lism-css/cli` の `runCreate` に委譲する。
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let template: string | undefined;
  let targetDir: string | undefined;
  let force = false;
  let showHelp = false;

  // --help の description や printHelp 表示に言語選択を反映させるため、
  // まず `--lang` を先に走査してから残りの引数を処理する。
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--lang' && args[i + 1]) {
      setLang(args[i + 1]);
    } else if (a.startsWith('--lang=')) {
      setLang(a.slice('--lang='.length));
    }
  }

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-t' || a === '--template') {
      template = args[++i];
    } else if (a.startsWith('--template=')) {
      template = a.slice('--template='.length);
    } else if (a === '-f' || a === '--force') {
      force = true;
    } else if (a === '--lang') {
      i++; // 値を 1 つ飛ばす（上で既に setLang 済み）
    } else if (a.startsWith('--lang=')) {
      // 何もしない（上で既に setLang 済み）
    } else if (a === '-h' || a === '--help') {
      showHelp = true;
    } else if (!a.startsWith('-')) {
      targetDir ??= a;
    }
  }

  if (showHelp) {
    printHelp();
    return;
  }

  await runCreate({ template, targetDir, force });
}

function printHelp(): void {
  process.stdout.write(
    [
      'Usage: create-lism [targetDir] [options]',
      '',
      'Options:',
      `  -t, --template <name>   ${t('cli.create.opt.template')}`,
      `  -f, --force             ${t('cli.create.opt.force')}`,
      `      --lang <code>       ${t('cli.opt.lang')}`,
      `  -h, --help              ${t('create-lism.opt.help')}`,
      '',
    ].join('\n')
  );
}

main().catch((err: unknown) => {
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
