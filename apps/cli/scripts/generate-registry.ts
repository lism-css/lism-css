/**
 * lism-ui/src/ からコンポーネントを走査し、registry JSON を public/r/ に生成する。
 *
 * - shared / react / astro にファイルを分類
 * - helper import を {{HELPER}} プレースホルダーに変換
 * - コンポーネント別 JSON、カタログ index.json、helper JSON を出力
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const UI_SRC = path.resolve(ROOT, 'packages/lism-ui/src');
const COMPONENTS_DIR = path.resolve(UI_SRC, 'components');
const HELPER_DIR = path.resolve(UI_SRC, 'helper');
const OUTPUT_DIR = path.resolve(__dirname, '../public/r');

// --- 型定義 ---

interface FileEntry {
  path: string;
  content: string;
}

interface ComponentMeta {
  name: string;
  description: string;
  helpers: string[];
}

interface ComponentJson {
  name: string;
  version: string;
  helpers: string[];
  files: {
    shared: FileEntry[];
    react: FileEntry[];
    astro: FileEntry[];
  };
}

interface CatalogJson {
  version: string;
  components: ComponentMeta[];
  helpers: string[];
}

// --- ユーティリティ ---

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

/** ディレクトリ内のファイルを再帰的に取得 */
function walkFiles(dir: string, base = dir): string[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, base));
    } else {
      files.push(path.relative(base, fullPath));
    }
  }

  return files;
}

/**
 * helper への相対 import を {{HELPER}} プレースホルダーに置換する。
 *
 * パターン例:
 *   ../../helper/animation   → {{HELPER}}/animation
 *   ../../../helper/uuid.js  → {{HELPER}}/uuid.js
 */
function replaceHelperImports(content: string): { content: string; helpers: string[] } {
  const helpers = new Set<string>();

  // from '../../helper/xxx' or from "../../../helper/xxx.js" 等にマッチ
  const replaced = content.replace(
    /(from\s+['"])(\.\.\/)+helper\/([^'"]+)(['"])/g,
    (_match: string, prefix: string, _dots: string, helperPath: string, suffix: string) => {
      // helper 名を拡張子なしで取得
      const helperName = helperPath.replace(/\.[^.]+$/, '');
      helpers.add(helperName);
      return `${prefix}{{HELPER}}/${helperPath}${suffix}`;
    }
  );

  return { content: replaced, helpers: [...helpers] };
}

/** ファイルを shared / react / astro に分類 */
function classifyFile(relativePath: string): 'react' | 'astro' | 'shared' {
  if (relativePath.startsWith('react/')) return 'react';
  if (relativePath.startsWith('astro/')) return 'astro';
  return 'shared';
}

// --- メイン処理 ---

function generateRegistry(): void {
  const uiPkgJson = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'packages/lism-ui/package.json'), 'utf-8')) as { version: string };
  const version: string = uiPkgJson.version;

  ensureDir(OUTPUT_DIR);
  ensureDir(path.join(OUTPUT_DIR, '_helpers'));

  // 内部エクスポートファイル（registry 対象外）
  const excludeFiles = new Set(['__contexts.js', 'react.ts', 'astro.ts']);

  const componentDirs = fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const catalog: CatalogJson = {
    version,
    components: [],
    helpers: [],
  };

  const allHelpers = new Set<string>();

  // --- コンポーネント JSON 生成 ---
  for (const componentName of componentDirs) {
    const componentDir = path.join(COMPONENTS_DIR, componentName);
    const files = walkFiles(componentDir);
    const componentHelpers = new Set<string>();

    const classified: ComponentJson['files'] = {
      shared: [],
      react: [],
      astro: [],
    };

    for (const file of files) {
      if (excludeFiles.has(file)) continue;

      const fullPath = path.join(componentDir, file);
      const rawContent = fs.readFileSync(fullPath, 'utf-8');

      const { content, helpers } = replaceHelperImports(rawContent);
      for (const h of helpers) {
        componentHelpers.add(h);
        allHelpers.add(h);
      }

      const category = classifyFile(file);
      classified[category].push({ path: file, content });
    }

    const helperList = [...componentHelpers];

    const componentJson: ComponentJson = {
      name: componentName.toLowerCase(),
      version,
      helpers: helperList,
      files: classified,
    };

    const outputPath = path.join(OUTPUT_DIR, `${componentName.toLowerCase()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(componentJson, null, '\t'));

    catalog.components.push({
      name: componentName.toLowerCase(),
      description: componentName,
      helpers: helperList,
    });
  }

  // --- helper JSON 生成 ---
  if (fs.existsSync(HELPER_DIR)) {
    const helperFiles = walkFiles(HELPER_DIR);

    for (const file of helperFiles) {
      const helperName = file.replace(/\.[^.]+$/, '');
      allHelpers.add(helperName);

      const fullPath = path.join(HELPER_DIR, file);
      const content = fs.readFileSync(fullPath, 'utf-8');

      const helperJson = {
        name: helperName,
        files: [{ path: file, content }],
      };

      const outputPath = path.join(OUTPUT_DIR, '_helpers', `${helperName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(helperJson, null, '\t'));
    }
  }

  catalog.helpers = [...allHelpers].sort();

  // --- カタログ JSON 生成 ---
  const catalogPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, '\t'));

  console.log(`Registry generated: ${catalog.components.length} components, ${catalog.helpers.length} helpers`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

generateRegistry();
