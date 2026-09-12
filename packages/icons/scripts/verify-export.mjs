import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSvgIcons } from './config.mjs';
import { normalizeSvg } from './normalize-svg.mjs';

export async function verify(directory) {
  const icons = await readSvgIcons(directory);
  return Promise.all(
    icons.map(async ({ id }) => ({
      id,
      data: normalizeSvg(await readFile(join(directory, `${id}.svg`), 'utf8'), { id }),
    }))
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: verify-export.mjs {svg-directory}');
    const icons = await verify(process.argv[2]);
    console.log(`SVG export verified: ${icons.length} icons`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
