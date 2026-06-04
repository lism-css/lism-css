import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { downloadTemplate } from 'giget';
import { select, input, confirm } from '@inquirer/prompts';
import { logger } from '../logger.js';
import { LISM_CSS_VERSION } from '../version.js';
import { DEFAULT_TEMPLATES_REF, SOURCE_REPO, TEMPLATES_PATH } from '../constants.js';
import { getLang, t, tOf, type Lang } from '../i18n.js';
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
    label: { ja: 'LP', en: 'LP' },
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

  // 要求言語に対応する overlay があれば、base の上にマージする（生成テンプレ本体の言語切替）
  await applyLangOverlay(tpl, outDir, ref, getLang());

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

/**
 * 言語別 overlay を適用する。
 *
 * base 取得後、要求言語に対応する `langOverlays[lang]` があれば、その差分を temp に取得して
 * `outDir` へマージする（差分ファイルが base を上書きする）。
 * base 言語（多くは `ja`）には overlay を用意しない方針なので、その場合は何もしない。
 *
 * overlay の実体はテンプレート内の `.lang/{lang}/` に同梱されており、base 取得時にも
 * `outDir/.lang/` として降りてくるが、それは postProcessTemplate の cleanup で取り除く。
 */
async function applyLangOverlay(tpl: TemplateDef, outDir: string, ref: string, lang: Lang): Promise<void> {
  if (tpl.kind !== 'project') return;
  const overlayPath = tpl.langOverlays?.[lang];
  if (!overlayPath) return;

  const overlayDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-template-lang-'));
  try {
    await downloadTemplatePath(overlayPath, overlayDir, ref, true);
    mergeDirectory(overlayDir, outDir);
  } finally {
    fs.rmSync(overlayDir, { recursive: true, force: true });
  }
}

function postProcessTemplate(projectDir: string, tpl: TemplateDef): void {
  if (tpl.kind === 'static-html') return;

  if (tpl.kind === 'base-overlay' && tpl.rewritePackageName !== false) {
    rewritePackageName(projectDir, tpl.slug);
  }

  if (tpl.kind === 'single-project-variant') {
    extractVariantFiles(projectDir, tpl);
    rewritePackageName(projectDir, tpl.packageName ?? tpl.slug);
  }

  // 開発専用ファイル（screenshots/ と screenshots.config.json）を削除
  cleanupDevArtifacts(projectDir);

  // workspace:* を公開バージョンに書き換える
  rewriteWorkspaceDeps(projectDir);
}

/**
 * テンプレートに同梱されている配布不要ファイルを削除する。
 * - `screenshots/` + `screenshots.config.json`: docs サムネ生成用
 * - `.lang/`: 言語別 overlay の配信元（base 取得時に降りてくるが、生成プロジェクトには残さない）
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

  const langDir = path.join(projectDir, '.lang');
  if (fs.existsSync(langDir)) {
    fs.rmSync(langDir, { recursive: true, force: true });
  }
}

/**
 * single-project-variant 用の後処理。
 *
 * `src/` 直下のサブディレクトリ（`src/pages/`, `src/components/`, `src/styles/`, ...）について、
 * その中に対象 variant のディレクトリ（例: `src/components/{variant}/`）が存在するものを
 * 「variant 規約のディレクトリ」とみなし、以下の処理を行う:
 * （variant ディレクトリ直下はファイルのみを想定。ネストしたサブディレクトリ構成は非対応）
 *
 *   1. `src/{dir}/{variant}/` の中身を `src/{dir}/` 直下にマージ
 *      （variant ディレクトリが空でもエラーにせず、単に何もマージしないだけ）
 *   2. `src/{dir}/` 直下のサブディレクトリを全削除（自 variant + 他 variant をまとめて掃除）
 *
 * 加えて、配布ファイル内の `@/{dir}/{variant}/...` 形式の path-alias import を
 * `@/{dir}/...` に書き換える。
 *
 * `src/pages/{variant}/index.astro` の存在だけは必須（無ければエラー）。
 * その他のディレクトリ（components/styles/lib 等）では variant ディレクトリが存在しなければ
 * 何もしない（既存ファイルはそのまま）。
 */
function extractVariantFiles(projectDir: string, tpl: SingleProjectVariantTemplateDef): void {
  const srcDir = path.join(projectDir, 'src');
  const variant = tpl.variant;

  // `src/pages/{variant}/index.astro` の存在は必須
  const pagesVariantIndex = path.join(srcDir, 'pages', variant, 'index.astro');
  if (!fs.existsSync(pagesVariantIndex)) {
    throw new Error(
      t('create.variantMissing', {
        variant,
        path: `${formatTemplatePath(tpl.sourcePath)}/src/pages/${variant}/index.astro`,
      })
    );
  }

  if (!fs.existsSync(srcDir) || !fs.statSync(srcDir).isDirectory()) return;

  // `src/` 直下を走査し、variant ディレクトリを持つ parent だけ処理する
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const parentDir = path.join(srcDir, entry.name); // 例: src/pages, src/components
    const variantDirInside = path.join(parentDir, variant);

    if (!fs.existsSync(variantDirInside)) continue;
    if (!fs.statSync(variantDirInside).isDirectory()) continue;

    // variant ディレクトリの中身を parent 直下にマージ（中身が空でも問題ない）
    mergeDirectory(variantDirInside, parentDir);

    // parent 直下のサブディレクトリを全て削除（自 variant も他 variant も）
    for (const child of fs.readdirSync(parentDir, { withFileTypes: true })) {
      if (!child.isDirectory()) continue;
      fs.rmSync(path.join(parentDir, child.name), { recursive: true, force: true });
    }
  }

  // `@/{dir}/{variant}/...` を `@/{dir}/...` に書き換え
  rewriteVariantAliasImports(srcDir, variant);
}

/**
 * 配布後のファイル群に対して、path alias 経由の `@/{dir}/{variant}/...` 形式の参照を
 * `@/{dir}/...` に置換する。variant 名にメタ文字が含まれても安全なように escape する。
 *
 * 対象拡張子はテキスト系のソース/スタイルのみ。マッチしないファイルはそのまま。
 */
const ALIAS_REWRITE_EXTENSIONS = new Set([
  '.astro',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.md',
  '.mdx',
  '.vue',
  '.svelte',
  '.html',
]);

function rewriteVariantAliasImports(srcDir: string, variant: string): void {
  if (!fs.existsSync(srcDir)) return;

  // `@/<segment>/<variant>/` → `@/<segment>/`
  // <segment> は `/`, クォート, 空白を含まない 1 セグメント
  const pattern = new RegExp(`(@/[^/'"\\s\`]+)/${escapeRegExp(variant)}/`, 'g');

  walkFiles(srcDir, (filePath) => {
    const ext = path.extname(filePath);
    if (!ALIAS_REWRITE_EXTENSIONS.has(ext)) return;

    let original: string;
    try {
      original = fs.readFileSync(filePath, 'utf-8');
    } catch {
      return; // バイナリ等は無視
    }
    if (!original.includes(`/${variant}/`)) return; // 早期 short-circuit

    const replaced = original.replace(pattern, '$1/');
    if (replaced !== original) {
      fs.writeFileSync(filePath, replaced);
    }
  });
}

function walkFiles(dir: string, callback: (filePath: string) => void): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fp, callback);
    } else if (entry.isFile()) {
      callback(fp);
    }
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
