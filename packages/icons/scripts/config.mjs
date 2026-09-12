import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const packageDir = fileURLToPath(new URL('../', import.meta.url));

export async function readSvgIcons(sourceDir) {
  const files = (await readdir(sourceDir, { withFileTypes: true })).filter((entry) => /\.svg$/i.test(entry.name));
  if (!files.length) throw new Error('SVGがありません');
  const names = new Set();
  const components = new Set();
  return files
    .map((entry) => {
      const id = entry.name.slice(0, -4);
      if (!entry.isFile() || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.svg$/.test(entry.name)) throw new Error(`不正なSVGファイル名: ${entry.name}`);
      const component = id
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join('');
      const key = component.toLowerCase();
      if (names.has(id) || components.has(key)) throw new Error(`重複するSVG名: ${id}`);
      names.add(id);
      components.add(key);
      return { id };
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
