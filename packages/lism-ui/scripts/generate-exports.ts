/** package.json の `exports` を src/components/ から自動生成する。 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.resolve(PKG_ROOT, 'src/components');
const DIST_COMPONENTS_DIR = path.resolve(PKG_ROOT, 'dist/components');
const PKG_JSON = path.resolve(PKG_ROOT, 'package.json');

interface ExportEntry {
  import: string;
  types?: string;
}

type ExportsField = Record<string, ExportEntry | string>;

function getComponentNames(): string[] {
  return fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => {
      const dir = path.join(COMPONENTS_DIR, name);
      return fs.existsSync(path.join(dir, 'astro/index.ts')) && fs.existsSync(path.join(dir, 'react/index.ts'));
    })
    .sort();
}

// シンプル系（`react/index.ts` が単一の re-export だけ）はビルド時に index.js が
// 出力されないため、dist の実体を見て `X.js` か `index.js` を切り替える。
// この前提で本スクリプトは vite build の後ろで走らせる必要がある。
function getReactDistEntryFile(componentName: string): string {
  const distDir = path.join(DIST_COMPONENTS_DIR, componentName, 'react');
  return fs.existsSync(path.join(distDir, 'index.js')) ? 'index.js' : `${componentName}.js`;
}

function buildExports(componentNames: string[]): ExportsField {
  const result: ExportsField = {};

  result['./react'] = {
    import: './dist/components/react.js',
    types: './dist/components/react.d.ts',
  };
  for (const name of componentNames) {
    const entry = getReactDistEntryFile(name);
    result[`./react/${name}`] = {
      import: `./dist/components/${name}/react/${entry}`,
      types: `./dist/components/${name}/react/index.d.ts`,
    };
  }

  result['./astro'] = {
    import: './src/components/astro.ts',
  };
  for (const name of componentNames) {
    result[`./astro/${name}`] = {
      import: `./src/components/${name}/astro/index.ts`,
    };
  }

  result['./scripts/*'] = './dist/scripts/*.js';
  result['./style.css'] = './dist/style.css';

  return result;
}

function main(): void {
  const componentNames = getComponentNames();
  const nextExports = buildExports(componentNames);

  const pkg = JSON.parse(fs.readFileSync(PKG_JSON, 'utf-8')) as Record<string, unknown> & {
    exports?: ExportsField;
  };

  if (JSON.stringify(pkg.exports ?? {}) === JSON.stringify(nextExports)) {
    console.log(`exports already up-to-date (${componentNames.length} components)`);
    return;
  }

  pkg.exports = nextExports;
  fs.writeFileSync(PKG_JSON, JSON.stringify(pkg, null, 2) + '\n');

  console.log(`✓ exports updated: ${componentNames.length} components`);
  console.log(`  ${componentNames.join(', ')}`);
}

main();
