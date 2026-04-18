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
  noExternal: ['@lism-css/cli', '@inquirer/prompts', 'commander', 'giget', 'jiti', 'picocolors'],
});
