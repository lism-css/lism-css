// dist 内 d.ts の相対 import が dist の中だけで解決できるか検証する。
// モノレポ内では <pkg>/config 等の実ファイルへ解決できてしまい、公開物でだけ型が any に落ちる不具合を typecheck では検出できないため。
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
const SPECIFIER = /(?:from\s*|import\s*\(\s*|import\s+)(['"])(\.{1,2}\/[^'"]+)\1/g;
const isFile = (path) => statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;

const errors = [];
for (const file of readdirSync(distDir, { recursive: true })) {
  if (!file.endsWith('.d.ts')) continue;
  const filePath = join(distDir, file);
  for (const [, , spec] of readFileSync(filePath, 'utf8').matchAll(SPECIFIER)) {
    const target = resolve(dirname(filePath), spec.replace(/\.js$/, ''));
    const inDist = !relative(distDir, target).startsWith('..');
    if (!inDist || !['.d.ts', '/index.d.ts', ''].some((suffix) => isFile(target + suffix))) {
      errors.push(`dist/${file}: '${spec}'`);
    }
  }
}

if (errors.length) {
  console.error(`dist 内で解決できない相対 import があります:\n${errors.join('\n')}`);
  process.exit(1);
}
console.log('verify-dts-imports: OK');
