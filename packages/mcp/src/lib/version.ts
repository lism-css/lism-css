import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// src/lib/（開発時）と dist/lib/（ビルド後）のどちらから見ても package.json は 2 つ上の階層にある
const pkgPath = resolve(__dirname, '..', '..', 'package.json');

/** package.json の version（サーバーが名乗るバージョンの単一情報源） */
export const packageVersion: string = (JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string }).version;
