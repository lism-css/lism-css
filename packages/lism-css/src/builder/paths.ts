/**
 * パッケージ自己位置の解決を集約する（bin の `__dirname` 相当）。
 *
 * dist/builder/paths.js → packageRoot。`src/scss`・`dist/css`・`dist` はいずれも publish 物に含まれるため、
 * consumer の node_modules でもモノレポの workspace でも解決できる。
 *
 * ※ `new URL('../../', import.meta.url)` は Vite のアセット変換（vite:asset-import-meta-url）に
 *   誤検知されてビルド時に data URL へインライン化されるため使わない。
 *   `fileURLToPath(import.meta.url)` + `path` ベースで解決する。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const distDir = path.join(packageRoot, 'dist');
export const scssDir = path.join(packageRoot, 'src', 'scss');
export const cssDistDir = path.join(packageRoot, 'dist', 'css');
