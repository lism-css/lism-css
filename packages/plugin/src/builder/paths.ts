import path from 'node:path';
import { fileURLToPath } from 'node:url';

function resolvePackagePath(specifier: string): string {
  return fileURLToPath(import.meta.resolve(specifier));
}

const mainScssPath = resolvePackagePath('lism-css/scss/main.scss');
const mainCssPath = resolvePackagePath('lism-css/main.css');

export const scssDir = path.dirname(mainScssPath);
export const cssDistDir = path.dirname(mainCssPath);
export const distDir = path.dirname(cssDistDir);
export const packageRoot = path.dirname(distDir);
