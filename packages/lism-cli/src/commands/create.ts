import fs from 'node:fs';
import path from 'node:path';
import { downloadTemplate } from 'giget';
import { select, input, confirm } from '@inquirer/prompts';
import { logger } from '../logger.js';
import { LISM_CSS_VERSION } from '../version.js';

interface TemplateDef {
  name: string;
  label: string;
  description: string;
}

/** 配信対象の examples 一覧（将来は examples ディレクトリから自動生成に置き換え可能） */
const TEMPLATES: TemplateDef[] = [{ name: 'astro-minimal', label: 'Astro (minimal)', description: 'Astro ベースの最小構成' }];

interface CreateOptions {
  template?: string;
  force?: boolean;
}

export interface RunCreateArgs {
  template?: string;
  targetDir?: string;
  force?: boolean;
}

/** `lism create` / `create-lism` から共通で使える実体関数 */
export async function runCreate({ template, targetDir, force = false }: RunCreateArgs): Promise<void> {
  const tpl = await resolveTemplate(template);
  const outDir = path.resolve(process.cwd(), await resolveTargetDir(targetDir, tpl.name));

  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length > 0 && !force) {
    const ok = await confirm({
      message: `${outDir} は既に存在し、空ではありません。上書きしますか？`,
      default: false,
    });
    if (!ok) {
      logger.warn('中断しました。');
      return;
    }
  }

  const ref = process.env.LISM_CREATE_REF || 'main';
  logger.info(`テンプレート "${tpl.name}" を取得中（ref: ${ref}）...`);
  await downloadTemplate(`github:lism-css/lism-css/examples/${tpl.name}#${ref}`, {
    dir: outDir,
    force: true,
    forceClean: force,
  });

  // workspace:* を公開バージョンに書き換える
  rewriteWorkspaceDeps(outDir);

  logger.success(`${outDir} にプロジェクトを生成しました。`);
  logger.log('');
  logger.log('次のコマンドで開発を開始できます:');
  const rel = path.relative(process.cwd(), outDir) || '.';
  logger.log(`  cd ${rel}`);
  logger.log('  npm install   # or pnpm install / yarn');
  logger.log('  npm run dev');
}

/** commander から呼ぶアクション */
export async function createCommand(targetDir: string | undefined, options: CreateOptions): Promise<void> {
  await runCreate({ template: options.template, targetDir, force: options.force });
}

async function resolveTemplate(requested?: string): Promise<TemplateDef> {
  if (requested) {
    const found = TEMPLATES.find((t) => t.name === requested);
    if (!found) {
      throw new Error(`テンプレート "${requested}" は見つかりません。利用可能: ${TEMPLATES.map((t) => t.name).join(', ')}`);
    }
    return found;
  }
  const picked = await select<string>({
    message: 'テンプレートを選択してください:',
    choices: TEMPLATES.map((t) => ({ name: `${t.label} — ${t.description}`, value: t.name })),
  });
  return TEMPLATES.find((t) => t.name === picked)!;
}

async function resolveTargetDir(provided: string | undefined, templateName: string): Promise<string> {
  if (provided) return provided;
  return input({
    message: '出力先ディレクトリ:',
    default: `./${templateName}`,
  });
}

/**
 * 取得後の package.json 内の `workspace:*` 依存を `^{LISM_CSS_VERSION}` に書き換える。
 * 失敗しても警告に留め、生成自体は続行する（Best Effort）。
 */
function rewriteWorkspaceDeps(projectDir: string): void {
  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    let touched = false;
    for (const key of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
      const deps = pkg[key];
      if (!deps) continue;
      for (const [name, value] of Object.entries(deps)) {
        if (typeof value !== 'string') continue;
        if (value.startsWith('workspace:')) {
          deps[name] = `^${LISM_CSS_VERSION}`;
          touched = true;
        }
      }
    }
    if (touched) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      logger.log(`  package.json の workspace:* を ^${LISM_CSS_VERSION} に置換しました。`);
    }
  } catch (err) {
    logger.warn(`package.json の書き換えに失敗しました: ${String(err)}`);
  }
}
