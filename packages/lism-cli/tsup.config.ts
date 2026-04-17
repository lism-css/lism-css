import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// lism-css の現在バージョンを `lism create` の workspace:* 置換用に埋め込む
const lismCssPkg = JSON.parse(readFileSync(resolve(__dirname, '../lism-css/package.json'), 'utf-8')) as {
  version: string;
};

export default defineConfig({
  entry: ['src/index.ts', 'src/index-legacy.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  target: 'node18',
  define: {
    __LISM_CSS_VERSION__: JSON.stringify(lismCssPkg.version),
  },
});
