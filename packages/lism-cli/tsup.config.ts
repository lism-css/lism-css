import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// lism-css の現在バージョンを `lism create` の workspace:* 置換用に埋め込む
const lismCssPkg = JSON.parse(readFileSync(resolve(__dirname, '../lism-css/package.json'), 'utf-8')) as {
  version: string;
};

// `lism --version` 用に自身のバージョンを埋め込む（package.json と createProgram.ts の二重管理回避）
const cliPkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8')) as {
  version: string;
};

export default defineConfig({
  entry: ['src/index.ts', 'src/index-legacy.ts', 'src/lib.ts'],
  format: ['esm'],
  // lib.ts の公開 API を TypeScript から消費する create-lism のために dts を生成
  dts: { entry: 'src/lib.ts' },
  clean: true,
  target: 'node18',
  define: {
    __LISM_CSS_VERSION__: JSON.stringify(lismCssPkg.version),
    __CLI_VERSION__: JSON.stringify(cliPkg.version),
  },
});
