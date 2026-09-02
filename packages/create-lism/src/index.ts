import { runCreate, setLang, t } from 'lism-cli';

/**
 * `pnpm create lism` / `npm create lism@latest` から呼ばれる薄いラッパー。
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let template: string | undefined;
  let targetDir: string | undefined;
  let force = false;
  let showHelp = false;
  let lang: string | undefined;

  // --help の description や printHelp 表示に言語選択を反映させるため、
  // まず `--lang` を先に走査してから残りの引数を処理する。
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--lang' && args[i + 1]) {
      lang = args[i + 1];
      setLang(lang);
    } else if (a.startsWith('--lang=')) {
      lang = a.slice('--lang='.length);
      setLang(lang);
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
      i++;
    } else if (a.startsWith('--lang=')) {
      // 先行走査で処理済み
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

  await runCreate({ template, targetDir, force, lang });
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
      `  -h, --help              ${t('common.help')}`,
      '',
    ].join('\n')
  );
}

main().catch((err: unknown) => {
  // プロンプトの Ctrl+C 中断はユーザーの意思なので、何も表示せず SIGINT 慣例の 130 で終了する
  if (err instanceof Error && err.name === 'ExitPromptError') process.exit(130);
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
