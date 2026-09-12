import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { icons, coreIconNames } from '@lism-css/icons/data';

const target = new URL('../src/components/atomic/Icon/presets.ts', import.meta.url);
const options = await resolveConfig(fileURLToPath(target));
const defaults = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const expectedAttributes = { fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
if (new Set(coreIconNames).size !== coreIconNames.length) throw new Error('Duplicate core icon name');
for (const id of coreIconNames) {
  const icon = icons[id];
  if (!icon || icon.viewBox !== defaults.viewBox || JSON.stringify(icon.attributes) !== JSON.stringify(expectedAttributes)) {
    throw new Error(`Core icon must use the default stroke attributes: ${id}`);
  }
}
const entries = (names) => names.map((id) => `${JSON.stringify(id)}: { ...defaults, body: ${JSON.stringify(icons[id].body)} }`).join(',\n');
const source = await format(
  `// 自動生成: bin/generate-icon-presets.mjs（入力: @lism-css/icons/data）\nconst defaults = ${JSON.stringify(defaults)} as const;\nexport const originalIcons = {${entries(coreIconNames)}};\n/** @deprecated Use originalIcons. */\nexport const phIcons = originalIcons;\nexport default originalIcons;\n`,
  { ...options, filepath: fileURLToPath(target) }
);
const outputs = [[target, source]];
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--check')) throw new Error('Usage: generate-icon-presets.mjs [--check]');
for (const [file, contents] of outputs) {
  if (args.includes('--check')) {
    if ((await readFile(file, 'utf8')) !== contents) throw new Error(`Generated file is out of date: ${file.pathname.split('/').pop()}`);
  } else await writeFile(file, contents);
}
console.log(`Core icon presets: ${coreIconNames.length}`);
