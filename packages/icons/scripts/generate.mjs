import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { icons, coreIconNames, packageDir } from './config.mjs';
import { normalizeSvg } from './normalize-svg.mjs';

const header = '// 自動生成: scripts/generate.mjs（編集元: src/svg/）\n';
const componentName = (id) =>
  id
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
const reactAttribute = (key) =>
  key.startsWith('aria-') || key.startsWith('data-') ? key : key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const attributesText = (attributes, react = false) =>
  Object.entries(attributes)
    .map(([key, value]) => `${react ? reactAttribute(key) : key}="${value}"`)
    .join(' ');

function reactSource(name, normalized) {
  const defaults = attributesText({ xmlns: 'http://www.w3.org/2000/svg', viewBox: normalized.viewBox, ...normalized.attributes }, true);
  const body = normalized.body.replace(/([\w-]+)=/g, (_, key) => `${reactAttribute(key)}=`);
  return `${header}import { forwardRef, type SVGProps } from 'react';

export type ${name}Props = SVGProps<SVGSVGElement> & { size?: number | string };
const ${name} = /* @__PURE__ */ forwardRef<SVGSVGElement, ${name}Props>(function ${name}({ children, size = '1em', width = size, height = size, ...props }, ref) {
  const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);
  return <svg ${defaults} width={width} height={height} focusable="false" aria-hidden={labelled ? undefined : true} role={labelled ? 'img' : undefined} {...props} ref={ref}>${body}{children}</svg>;
});

export default ${name};
`;
}

// Astroのスプレッドは明示属性を上書きせず両方出力するため、利用側が上書きできる属性は分割代入で取り出してから出力する。
function astroSource(normalized) {
  const { 'stroke-width': strokeWidth, ...attributes } = normalized.attributes;
  const defaults = attributesText({ xmlns: 'http://www.w3.org/2000/svg', viewBox: normalized.viewBox, ...attributes });
  return `---
${header}import type { HTMLAttributes } from 'astro/types';
type Props = HTMLAttributes<'svg'> & { size?: number | string; strokeWidth?: number | string };
const { strokeWidth, 'stroke-width': nativeStrokeWidth, size = '1em', width = size, height = size, focusable = 'false', 'aria-hidden': ariaHidden, role, ...props } = Astro.props;
const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);
---
<svg ${defaults} width={width} height={height} focusable={focusable} aria-hidden={ariaHidden ?? (labelled ? undefined : true)} role={role ?? (labelled ? 'img' : undefined)} stroke-width={nativeStrokeWidth ?? strokeWidth${strokeWidth ? ` ?? ${JSON.stringify(strokeWidth)}` : ''}} {...props}>${normalized.body}<slot /></svg>
`;
}

export async function generate({ root = packageDir, sourceDir = join(root, 'src/svg'), check = false } = {}) {
  const expectedNames = icons.map(({ id }) => `${id}.svg`).sort();
  const actualNames = (await readdir(sourceDir)).sort();
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    throw new Error('src/svgのファイル名がconfig.mjsと一致しません');
  }
  const normalized = await Promise.all(
    icons.map(async (icon) => ({
      id: icon.id,
      data: normalizeSvg(await readFile(join(sourceDir, `${icon.id}.svg`), 'utf8'), icon),
    }))
  );
  const files = new Map();
  const data = {};
  for (const { id, data: icon } of normalized) {
    const name = componentName(id);
    files.set(`src/react/${name}.tsx`, reactSource(name, icon));
    files.set(`packages/astro/${name}.astro`, astroSource(icon));
    data[id] = { viewBox: icon.viewBox, attributes: icon.attributes, body: icon.body };
  }
  files.set(
    'src/react/index.ts',
    header + normalized.map(({ id }) => `export { default as ${componentName(id)} } from './${componentName(id)}.js';`).join('\n') + '\n'
  );
  files.set(
    'packages/astro/index.ts',
    header + normalized.map(({ id }) => `export { default as ${componentName(id)} } from './${componentName(id)}.astro';`).join('\n') + '\n'
  );
  files.set(
    'src/data.ts',
    `${header}export const icons = ${JSON.stringify(data)} as const;\nexport type IconName = keyof typeof icons;\nexport const coreIconNames = ${JSON.stringify(coreIconNames)} as const;\n`
  );

  const options = await resolveConfig(join(packageDir, 'src/data.ts'));
  for (const [path, source] of files) {
    files.set(path, await format(source, { ...options, filepath: join(packageDir, path) }));
  }
  const stale = [];
  for (const directory of ['src/react', 'packages/astro']) {
    let entries;
    try {
      entries = await readdir(join(root, directory), { withFileTypes: true });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      entries = [];
    }
    for (const entry of entries) {
      const path = `${directory}/${entry.name}`;
      if (!entry.isFile() || files.has(path) || !/\.(tsx|astro|ts)$/.test(entry.name)) continue;
      const source = await readFile(join(root, path), 'utf8');
      if (source.includes(header.trim())) stale.push(path);
    }
  }
  if (check) {
    const mismatches = [...stale];
    for (const [path, source] of files) {
      let actual;
      try {
        actual = await readFile(join(root, path), 'utf8');
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      if (actual !== source) mismatches.push(path);
    }
    if (mismatches.length) throw new Error(`生成物が一致しません:\n${mismatches.join('\n')}`);
  } else {
    for (const [path, source] of files) {
      await mkdir(dirname(join(root, path)), { recursive: true });
      await writeFile(join(root, path), source);
    }
    for (const path of stale) await rm(join(root, path));
  }
  return files.size;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.slice(2).some((argument) => argument !== '--check')) throw new Error('使い方: generate.mjs [--check]');
    const check = process.argv.includes('--check');
    const count = await generate({ check });
    console.log(`${count}ファイルを${check ? '検証' : '生成'}しました`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
