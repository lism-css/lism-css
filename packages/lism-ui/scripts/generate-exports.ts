/**
 * packages/lism-ui/src/components/ を走査し、package.json の `exports` フィールドを
 * 自動生成する。
 *
 * - barrel (`@lism-css/ui/{react,astro}`) に加えて、各コンポーネントを個別 import できる
 *   deep path (`@lism-css/ui/{react,astro}/{Component}`) を提供する。
 * - これにより Astro の dev サーバーで barrel 経由で全コンポーネントの `_style.css` が
 *   読み込まれる問題（#354）を回避できる。
 *
 * react エントリは dist 出力構造の都合で、コンポーネントによって参照先ファイル名が変わる:
 *   - シンプル系（`react/index.ts` が `export { default } from './X';` のみ）
 *     → ビルド時に index.js が出力されないため、`./dist/.../react/X.js` を直接参照する。
 *   - コンパウンド系（`react/index.ts` が複数モジュールを集約する）
 *     → `./dist/.../react/index.js` を参照する。
 *
 * 末尾の `./scripts/*` / `./style.css` は手書きで保持。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.resolve(PKG_ROOT, 'src/components');
const PKG_JSON = path.resolve(PKG_ROOT, 'package.json');

interface ExportEntry {
  import: string;
  types?: string;
}

type ExportsField = Record<string, ExportEntry | string>;

/** components/ 配下から、astro と react の index.ts を持つディレクトリを列挙 */
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

/**
 * シンプル系（`export { default } from './X';` のみ）かどうかを判定し、
 * dist で参照すべきファイル名を返す。
 *
 * - シンプル系 → 再エクスポート先のファイル名（例: `Callout.js`）
 * - コンパウンド系 → `index.js`
 */
function getReactDistEntryFile(componentName: string): string {
  const indexPath = path.join(COMPONENTS_DIR, componentName, 'react/index.ts');
  const src = fs.readFileSync(indexPath, 'utf-8').trim();

  // `export { default } from './X';` パターン（前後の空白・末尾セミコロン許容）
  const match = src.match(/^export\s*\{\s*default\s*\}\s*from\s*['"]\.\/([^'"]+)['"]\s*;?\s*$/);
  if (match) {
    return `${match[1]}.js`;
  }
  return 'index.js';
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

  const pkgRaw = fs.readFileSync(PKG_JSON, 'utf-8');
  const pkg = JSON.parse(pkgRaw) as Record<string, unknown> & { exports?: ExportsField };

  const prevExportsJson = JSON.stringify(pkg.exports ?? {});
  const nextExportsJson = JSON.stringify(nextExports);

  if (prevExportsJson === nextExportsJson) {
    console.log(`exports already up-to-date (${componentNames.length} components)`);
    return;
  }

  pkg.exports = nextExports;
  fs.writeFileSync(PKG_JSON, JSON.stringify(pkg, null, 2) + '\n');

  console.log(`✓ exports updated: ${componentNames.length} components`);
  console.log(`  ${componentNames.join(', ')}`);
}

main();
