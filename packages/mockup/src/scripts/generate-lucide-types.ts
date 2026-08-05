/**
 * `types/lucide-react.d.ts` を書き出すビルド用スクリプト。
 *
 * `package.json` の `build` から、`tsc` でコンパイルした後に実行する
 * （`@iconify-json/lucide` を更新すれば次のビルドで自動的に追従するので、生成物は commit しない）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadLucideIconSet } from '../vite/lucide-icons.js';
import { generateLucideTypes, LUCIDE_TYPES_FILE } from '../vite/lucide-types.js';

// `src/scripts/` と `dist/scripts/` はパッケージルートから同じ深さにあるので、URL は1つで足りる。
const outFile = fileURLToPath(new URL(`../../${LUCIDE_TYPES_FILE}`, import.meta.url));

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, generateLucideTypes(loadLucideIconSet()), 'utf-8');

console.log(`[lism-mockup] Generated ${LUCIDE_TYPES_FILE}`);
