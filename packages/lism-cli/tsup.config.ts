import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/index-legacy.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  target: 'node18',
});
