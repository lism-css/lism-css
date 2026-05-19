import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { downloadTemplate } from 'giget';
import { select, input, confirm } from '@inquirer/prompts';
import { logger } from '../logger.js';
import { LISM_CSS_VERSION } from '../version.js';
import { DEFAULT_TEMPLATES_REF, SOURCE_REPO, TEMPLATES_PATH } from '../constants.js';
import { t, tOf } from '../i18n.js';
import type { MessageKey } from '../messages.js';
import {
  TEMPLATES,
  type CategoryId,
  type LocalizedText,
  type SingleProjectVariantTemplateDef,
  type Stack as TemplateStack,
  type TemplateDef,
} from '@templates/manifest.js';

interface CategoryDef {
  id: CategoryId;
  label: LocalizedText;
  variantPromptKey?: MessageKey;
}

type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
};

const STACK_LABELS: Record<TemplateStack, LocalizedText> = {
  astro: { ja: 'Astro', en: 'Astro' },
  next: { ja: 'Next.js', en: 'Next.js' },
  vite: { ja: 'Vite + React', en: 'Vite + React' },
  html: { ja: 'Static HTML', en: 'Static HTML' },
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
    id: 'web',
    label: { ja: 'Web', en: 'Web' },
    variantPromptKey: 'create.promptSelectVariant.web',
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
  await runCreateWithTemplates({ template, targetDir, force }, TEMPLATES);
}

export async function runCreateWithTemplates({ template, targetDir, force = false }: RunCreateArgs, templates: TemplateDef[]): Promise<void> {
  // draft:true は CLI からは完全に隠す（一覧・選択・slug 直接指定すべて unknown 扱い）
  const availableTemplates = templates.filter((tpl) => !tpl.draft);
  const tpl = await resolveTemplate(template, availableTemplates);
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
  await downloadTemplateSource(tpl, outDir, ref, force);

  ensureTemplateDownloaded(outDir, tpl);

  postProcessTemplate(outDir, tpl);

  logger.success(t('create.created', { dir: outDir }));
  printNextSteps(outDir, tpl);
}

/** commander から呼ぶアクション */
export async function createCommand(targetDir: string | undefined, options: CreateOptions): Promise<void> {
  await runCreate({ template: options.template, targetDir, force: options.force });
}

async function resolveTemplate(requested: string | undefined, templates: TemplateDef[]): Promise<TemplateDef> {
  if (requested) {
    const found = templates.find((t) => t.slug === requested);
    if (found) return found;

    const matchedCategory = CATEGORIES.find((category) => category.id === requested);
    const categoryTemplates = matchedCategory ? templates.filter((tpl) => tpl.category === matchedCategory.id) : [];
    if (matchedCategory && categoryTemplates.length > 0) {
      return resolveFromCategory(matchedCategory.id, categoryTemplates);
    }

    throw new Error(t('create.templateNotFound', { name: requested, list: templates.map((x) => x.slug).join(', ') }));
  }

  const category = await select<CategoryId>({
    message: t('create.promptSelectCategory'),
    choices: CATEGORIES.filter((category) => templates.some((tpl) => tpl.category === category.id)).map((category) => ({
      name: tOf(category.label),
      value: category.id,
    })),
  });

  return resolveFromCategory(
    category,
    templates.filter((tpl) => tpl.category === category)
  );
}

async function resolveFromCategory(category: CategoryId, categoryTemplates: TemplateDef[]): Promise<TemplateDef> {
  const stack = await resolveStack(categoryTemplates);
  const stackTemplates = categoryTemplates.filter((tpl) => tpl.stack === stack);
  const variant = await resolveVariant(category, stackTemplates);
  const variantTemplates = variant === undefined ? stackTemplates : stackTemplates.filter((tpl) => tpl.variant === variant);

  return variantTemplates[0];
}

async function resolveVariant(category: CategoryId, templates: TemplateDef[]): Promise<string | undefined> {
  const variants = uniqueDefined(templates.map((tpl) => tpl.variant));
  if (variants.length <= 1) return variants[0];

  const categoryDef = CATEGORIES.find((item) => item.id === category);
  const messageKey = categoryDef?.variantPromptKey ?? 'create.promptSelectVariant';

  return select<string>({
    message: t(messageKey, { count: variants.length }),
    choices: variants.map((variant) => {
      const tpl = templates.find((item) => item.variant === variant)!;
      return {
        name: `${tOf(tpl.variantLabel ?? { ja: variant ?? '', en: variant ?? '' })} — ${tOf(tpl.description)}`,
        value: variant,
      };
    }),
  });
}

async function resolveStack(templates: TemplateDef[]): Promise<TemplateStack> {
  const stacks = uniqueDefined(templates.map((tpl) => tpl.stack));
  if (stacks.length === 1) {
    const stack = stacks[0];
    logger.info(t('create.usingStack', { stack: tOf(STACK_LABELS[stack]), count: stacks.length }));
    return stack;
  }

  return select<TemplateStack>({
    message: t('create.promptSelectStack', { count: stacks.length }),
    choices: stacks.map((stack) => ({
      name: tOf(STACK_LABELS[stack]),
      value: stack,
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
  if (tpl.kind === 'static-html') {
    const indexPath = path.join(projectDir, 'index.html');
    if (fs.existsSync(indexPath)) return;
    throw new Error(t('create.templateIndexMissing', { name: tpl.slug, path: getTemplateSourcePath(tpl) }));
  }

  const pkgPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkgPath)) return;
  throw new Error(t('create.templatePackageMissing', { name: tpl.slug, path: getTemplateSourcePath(tpl) }));
}

async function downloadTemplateSource(tpl: TemplateDef, outDir: string, ref: string, forceClean: boolean): Promise<void> {
  if (tpl.kind === 'base-overlay') {
    await downloadTemplatePath(tpl.basePath, outDir, ref, forceClean);

    const overlayDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-template-overlay-'));
    try {
      await downloadTemplatePath(tpl.overlayPath, overlayDir, ref, true);
      mergeDirectory(overlayDir, outDir);
    } finally {
      fs.rmSync(overlayDir, { recursive: true, force: true });
    }
    return;
  }

  // single-project-variant / project / static-html は同じ取得方式
  await downloadTemplatePath(tpl.sourcePath, outDir, ref, forceClean);
}

async function downloadTemplatePath(sourcePath: string, outDir: string, ref: string, forceClean: boolean): Promise<void> {
  await downloadTemplate(`github:${SOURCE_REPO}/${TEMPLATES_PATH}/${sourcePath}#${ref}`, {
    dir: outDir,
    force: true,
    forceClean,
  });
}

function postProcessTemplate(projectDir: string, tpl: TemplateDef): void {
  if (tpl.kind === 'static-html') return;

  if (tpl.kind === 'base-overlay' && tpl.rewritePackageName !== false) {
    rewritePackageName(projectDir, tpl.slug);
  }

  if (tpl.kind === 'single-project-variant') {
    extractVariantPages(projectDir, tpl);
    rewritePackageName(projectDir, tpl.packageName ?? tpl.slug);
  }

  // 開発専用ファイル（screenshots/ と screenshots.config.json）を削除
  cleanupDevArtifacts(projectDir);

  // workspace:* を公開バージョンに書き換える
  rewriteWorkspaceDeps(projectDir);
}

/**
 * テンプレートに同梱されている開発専用のスクリーンショット関連ファイルを削除する。
 * （docs サムネ生成用なので、生成プロジェクトには不要）
 */
function cleanupDevArtifacts(projectDir: string): void {
  const screenshotsDir = path.join(projectDir, 'screenshots');
  if (fs.existsSync(screenshotsDir)) {
    fs.rmSync(screenshotsDir, { recursive: true, force: true });
  }

  const screenshotsConfig = path.join(projectDir, 'screenshots.config.json');
  if (fs.existsSync(screenshotsConfig)) {
    fs.rmSync(screenshotsConfig, { force: true });
  }
}

/**
 * `src/pages/{variant}/` の中身を `src/pages/` 直下にマージし、
 * 他 variant ディレクトリ（自分自身も含む `src/pages/*` 配下のサブディレクトリ）を削除する。
 * variant 配下に `_style.css` 等の付随ファイルがあれば、それらも一緒に持ち上げられる。
 */
function extractVariantPages(projectDir: string, tpl: SingleProjectVariantTemplateDef): void {
  const pagesDir = path.join(projectDir, 'src', 'pages');
  const variantDir = path.join(pagesDir, tpl.variant);
  const variantIndex = path.join(variantDir, 'index.astro');

  if (!fs.existsSync(variantIndex)) {
    throw new Error(
      t('create.variantMissing', {
        variant: tpl.variant,
        path: `${formatTemplatePath(tpl.sourcePath)}/src/pages/${tpl.variant}/index.astro`,
      })
    );
  }

  // variant ディレクトリの中身を src/pages/ 直下にマージ（既存ファイルは上書き）
  mergeDirectory(variantDir, pagesDir);

  // src/pages 直下のサブディレクトリを全て削除（選択した variant + 他の variant をまとめて掃除）
  for (const entry of fs.readdirSync(pagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    fs.rmSync(path.join(pagesDir, entry.name), { recursive: true, force: true });
  }
}

function printNextSteps(projectDir: string, tpl: TemplateDef): void {
  logger.heading(t('create.nextSteps'));
  const rel = path.relative(process.cwd(), projectDir) || '.';
  logger.log(`  cd ${rel}`);

  if (tpl.kind === 'static-html') {
    logger.log(t('create.nextStepsHtmlOpen'));
    logger.log('');
    return;
  }

  logger.log('  npm install   # or pnpm install / yarn');
  logger.log('  npm run dev');
  logger.log('');
}

function getTemplateSourcePath(tpl: TemplateDef): string {
  if (tpl.kind === 'base-overlay') return `${formatTemplatePath(tpl.basePath)} + ${formatTemplatePath(tpl.overlayPath)}`;
  return formatTemplatePath(tpl.sourcePath);
}

function formatTemplatePath(sourcePath: string): string {
  return `${TEMPLATES_PATH}/${sourcePath}`;
}

function uniqueDefined<T extends string>(values: Array<T | undefined>): T[] {
  return [...new Set(values.filter((value): value is T => value !== undefined))];
}

function mergeDirectory(fromDir: string, toDir: string): void {
  fs.mkdirSync(toDir, { recursive: true });
  for (const entry of fs.readdirSync(fromDir, { withFileTypes: true })) {
    const fromPath = path.join(fromDir, entry.name);
    const toPath = path.join(toDir, entry.name);

    if (entry.isDirectory()) {
      if (fs.existsSync(toPath) && !fs.statSync(toPath).isDirectory()) {
        fs.rmSync(toPath, { recursive: true, force: true });
      }
      mergeDirectory(fromPath, toPath);
      continue;
    }

    if (fs.existsSync(toPath)) {
      fs.rmSync(toPath, { recursive: true, force: true });
    }

    if (entry.isSymbolicLink()) {
      fs.symlinkSync(fs.readlinkSync(fromPath), toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  }
}

function rewritePackageName(projectDir: string, name: string): void {
  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as PackageJson;
    if (pkg.name === name) return;

    pkg.name = name;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    logger.log(t('create.packageNameRewritten', { name }));
  } catch (err) {
    logger.warn(t('create.packageNameFailed', { reason: String(err) }));
  }
}

/**
 * 取得後の package.json 内の `workspace:*` 依存を `^{LISM_CSS_VERSION}` に書き換える。
 * 失敗しても警告に留め、生成自体は続行する（Best Effort）。
 */
function rewriteWorkspaceDeps(projectDir: string): void {
  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as PackageJson;
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
