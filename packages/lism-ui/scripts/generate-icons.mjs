import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { format, resolveConfig } from 'prettier';

const usage = 'Usage: generate-icons.mjs --source <lism-css/icons のリポジトリパス> [--check]';
const names = ['alert', 'warning', 'check-circle', 'question', 'info', 'note', 'lightbulb', 'x'];
const target = new URL('../src/helper/icons.ts', import.meta.url);

const args = process.argv.slice(2);
let sourceDir;
let check = false;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  // pnpm run 経由では `--` がそのまま渡るので読み飛ばす
  if (arg === '--') continue;
  if (arg === '--check') {
    check = true;
  } else if (arg === '--source') {
    sourceDir = args[++i];
  } else if (arg.startsWith('--source=')) {
    sourceDir = arg.slice('--source='.length);
  } else {
    console.error(usage);
    process.exit(1);
  }
}
if (!sourceDir) {
  console.error(usage);
  process.exit(1);
}

const dataPath = path.resolve(sourceDir, 'dist/data.js');
if (!existsSync(dataPath)) {
  console.error(`Not found: ${dataPath}\niconsリポジトリで \`pnpm build\` を実行してください`);
  process.exit(1);
}
const { icons } = await import(pathToFileURL(dataPath).href);

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
const source = await format(
  '// 自動生成: scripts/generate-icons.mjs（入力: lism-css/icons リポジトリの dist/data.js）\n' + entries.join('\n') + '\n',
  {
    ...(await resolveConfig(fileURLToPath(target))),
    filepath: fileURLToPath(target),
  }
);

if (check) {
  if ((await readFile(target, 'utf8')) !== source) throw new Error('UI icons are out of date');
} else {
  await writeFile(target, source);
}
console.log(`UI icons: ${names.length}`);
