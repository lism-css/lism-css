import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

type PackageMeta = {
  name: string;
  version: string;
};

function readPackageMeta(packageJsonPath: string): PackageMeta {
  return JSON.parse(readFileSync(resolve(__dirname, packageJsonPath), 'utf-8')) as PackageMeta;
}

// `lism create` の workspace:* 置換用に、公開パッケージごとの現在バージョンを埋め込む
const packageVersions = Object.fromEntries(
  ['../lism-css/package.json', '../lism-ui/package.json', '../plugin/package.json'].map((packageJsonPath) => {
    const pkg = readPackageMeta(packageJsonPath);
    return [pkg.name, pkg.version];
  })
);

// `lism --version` 用に自身のバージョンを埋め込む（package.json と createProgram.ts の二重管理回避）
const cliPkg = readPackageMeta('package.json');

export default defineConfig({
  entry: ['src/index.ts', 'src/lib.ts'],
  format: ['esm'],
  // lib.ts の公開 API を TypeScript から消費する create-lism のために dts を生成
  dts: { entry: 'src/lib.ts' },
  clean: true,
  target: 'node18',
  define: {
    __LISM_CSS_VERSION__: JSON.stringify(packageVersions['lism-css']),
    __LISM_PACKAGE_VERSIONS__: JSON.stringify(packageVersions),
    __CLI_VERSION__: JSON.stringify(cliPkg.version),
  },
  // tsconfig の paths（@templates/*）を bundle 時に解決
  esbuildOptions(options) {
    options.alias = {
      '@templates': resolve(__dirname, '../../templates'),
    };
  },
});
