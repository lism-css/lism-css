import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { icons } from '@lism-css/icons/data';

const names = ['alert', 'warning', 'check-circle', 'question', 'info', 'note', 'lightbulb', 'x'];
const target = new URL('../src/helper/icons.ts', import.meta.url);
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--check')) throw new Error('Usage: generate-icons.mjs [--check]');

const entries = names.map((name) => {
  const icon = icons[name];
  if (!icon) throw new Error(`Missing UI icon: ${name}`);
  const attributes = Object.entries({ xmlns: 'http://www.w3.org/2000/svg', viewBox: icon.viewBox, ...icon.attributes })
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  const svg = `<svg ${attributes}>${icon.body}</svg>`;
  const exportName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) + 'Icon';
  return `export const ${exportName} = ${JSON.stringify(svg)};`;
});
const source = await format('// 自動生成: scripts/generate-icons.mjs（入力: @lism-css/icons/data）\n' + entries.join('\n') + '\n', {
  ...(await resolveConfig(fileURLToPath(target))),
  filepath: fileURLToPath(target),
});

if (args.includes('--check')) {
  if ((await readFile(target, 'utf8')) !== source) throw new Error('UI icons are out of date');
} else {
  await writeFile(target, source);
}
console.log(`UI icons: ${names.length}`);
