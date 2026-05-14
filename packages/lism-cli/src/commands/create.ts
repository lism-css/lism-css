import fs from 'node:fs';
import path from 'node:path';
import { downloadTemplate } from 'giget';
import { select, input, confirm } from '@inquirer/prompts';
import { logger } from '../logger.js';
import { LISM_CSS_VERSION } from '../version.js';
import { DEFAULT_TEMPLATES_REF, EXAMPLES_PATH, SOURCE_REPO } from '../constants.js';
import { t, tOf } from '../i18n.js';
import type { MessageKey } from '../messages.js';

interface LocalizedText {
  ja: string;
  en: string;
}

type Framework = 'astro' | 'next' | 'vite';
type CategoryId = 'minimal' | 'blog' | 'lp' | 'site';

interface CategoryDef {
  id: CategoryId;
  label: LocalizedText;
  variantPromptKey?: MessageKey;
}

interface TemplateDef {
  slug: string;
  category: CategoryId;
  variant?: string;
  variantLabel?: LocalizedText;
  framework: Framework;
  sourcePath: string;
  description: LocalizedText;
}

const FRAMEWORK_LABELS: Record<Framework, LocalizedText> = {
  astro: { ja: 'Astro', en: 'Astro' },
  next: { ja: 'Next.js', en: 'Next.js' },
  vite: { ja: 'Vite + React', en: 'Vite + React' },
};

const CATEGORIES: CategoryDef[] = [
  {
    id: 'minimal',
    label: { ja: 'Minimal', en: 'Minimal' },
  },
  {
    id: 'blog',
    label: { ja: 'Blog', en: 'Blog' },
    variantPromptKey: 'create.promptSelectVariant.blog',
  },
  {
    id: 'lp',
    label: { ja: 'Landing Page', en: 'Landing Page' },
    variantPromptKey: 'create.promptSelectVariant.lp',
  },
  {
    id: 'site',
    label: { ja: 'Site', en: 'Site' },
    variantPromptKey: 'create.promptSelectVariant.site',
  },
];

/** 配信対象の examples 一覧（将来は examples ディレクトリから自動生成に置き換え可能） */
const TEMPLATES: TemplateDef[] = [
  {
    slug: 'minimal-astro',
    category: 'minimal',
    framework: 'astro',
    sourcePath: 'minimal/astro',
    description: { ja: 'Astro ベースの最小構成', en: 'Minimal Astro setup' },
  },
  {
    slug: 'blog-astro-simple',
    category: 'blog',
    variant: 'simple',
    variantLabel: { ja: 'Simple', en: 'Simple' },
    framework: 'astro',
    sourcePath: 'blog/simple/astro',
    description: { ja: 'タグのみのシンプルな Astro ブログ', en: 'Simple Astro blog with tags' },
  },
  {
    slug: 'blog-astro-full',
    category: 'blog',
    variant: 'full',
    variantLabel: { ja: 'Full', en: 'Full' },
    framework: 'astro',
    sourcePath: 'blog/full/astro',
    description: { ja: 'カテゴリ・目次つきの Astro ブログ', en: 'Astro blog with categories and table of contents' },
  },
];

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
  const outDir = path.resolve(process.cwd(), await resolveTargetDir(targetDir, tpl.slug));

  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length > 0 && !force) {
    const ok = await confirm({
      message: t('create.confirmOverwrite', { dir: outDir }),
      default: false,
    });
    if (!ok) {
      logger.warn(t('create.aborted'));
      return;
    }
  }

  const ref = DEFAULT_TEMPLATES_REF;
  logger.info(t('create.fetching', { name: tpl.slug, ref }));
  await downloadTemplate(`github:${SOURCE_REPO}/${EXAMPLES_PATH}/${tpl.sourcePath}#${ref}`, {
    dir: outDir,
    force: true,
    forceClean: force,
  });

  ensureTemplateDownloaded(outDir, tpl);

  // workspace:* を公開バージョンに書き換える
  rewriteWorkspaceDeps(outDir);

  logger.success(t('create.created', { dir: outDir }));
  logger.heading(t('create.nextSteps'));
  const rel = path.relative(process.cwd(), outDir) || '.';
  logger.log(`  cd ${rel}`);
  logger.log('  npm install   # or pnpm install / yarn');
  logger.log('  npm run dev');
  logger.log('');
}

/** commander から呼ぶアクション */
export async function createCommand(targetDir: string | undefined, options: CreateOptions): Promise<void> {
  await runCreate({ template: options.template, targetDir, force: options.force });
}

async function resolveTemplate(requested?: string): Promise<TemplateDef> {
  if (requested) {
    const found = TEMPLATES.find((t) => t.slug === requested);
    if (!found) {
      throw new Error(t('create.templateNotFound', { name: requested, list: TEMPLATES.map((x) => x.slug).join(', ') }));
    }
    return found;
  }

  const category = await select<CategoryId>({
    message: t('create.promptSelectCategory'),
    choices: CATEGORIES.filter((category) => TEMPLATES.some((tpl) => tpl.category === category.id)).map((category) => ({
      name: tOf(category.label),
      value: category.id,
    })),
  });

  const categoryTemplates = TEMPLATES.filter((tpl) => tpl.category === category);
  const variant = await resolveVariant(category, categoryTemplates);
  const variantTemplates = categoryTemplates.filter((tpl) => tpl.variant === variant);
  const framework = await resolveFramework(variantTemplates);

  return variantTemplates.find((tpl) => tpl.framework === framework)!;
}

async function resolveVariant(category: CategoryId, templates: TemplateDef[]): Promise<string | undefined> {
  const variants = [...new Set(templates.map((tpl) => tpl.variant))];
  if (variants.length <= 1) return variants[0];

  const categoryDef = CATEGORIES.find((item) => item.id === category);
  const messageKey = categoryDef?.variantPromptKey ?? 'create.promptSelectVariant';

  return select<string>({
    message: t(messageKey),
    choices: variants.map((variant) => {
      const tpl = templates.find((item) => item.variant === variant)!;
      return {
        name: `${tOf(tpl.variantLabel ?? { ja: variant ?? '', en: variant ?? '' })} — ${tOf(tpl.description)}`,
        value: variant!,
      };
    }),
  });
}

async function resolveFramework(templates: TemplateDef[]): Promise<Framework> {
  const frameworks = [...new Set(templates.map((tpl) => tpl.framework))];
  if (frameworks.length === 1) return frameworks[0];

  return select<Framework>({
    message: t('create.promptSelectFramework'),
    choices: frameworks.map((framework) => ({
      name: tOf(FRAMEWORK_LABELS[framework]),
      value: framework,
    })),
  });
}

async function resolveTargetDir(provided: string | undefined, templateName: string): Promise<string> {
  if (provided) return provided;
  return input({
    message: t('create.promptTargetDir'),
    default: `./${templateName}`,
  });
}

function ensureTemplateDownloaded(projectDir: string, tpl: TemplateDef): void {
  const pkgPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkgPath)) return;
  throw new Error(t('create.templatePackageMissing', { name: tpl.slug, path: tpl.sourcePath }));
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
      logger.log(t('create.workspaceReplaced', { version: LISM_CSS_VERSION }));
    }
  } catch (err) {
    logger.warn(t('create.workspaceFailed', { reason: String(err) }));
  }
}
