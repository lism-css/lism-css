import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  target: 'node18',
  shims: true,
  banner: {
    js: "import { createRequire as __createRequire } from 'module'; const require = __createRequire(import.meta.url);",
  },
  // node 標準モジュール以外はすべて bundle に内包する。
  // lism-cli の依存変更に追従不要にするためハードコードを避ける。
  noExternal: [/.*/],
});
