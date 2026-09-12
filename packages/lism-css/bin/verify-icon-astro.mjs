import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'astro';

const packageDir = fileURLToPath(new URL('../', import.meta.url));
const cacheDir = join(packageDir, '.cache');
await mkdir(cacheDir, { recursive: true });
const fixtureDir = await mkdtemp(join(cacheDir, 'verify-icon-'));
const rootTag = (svg) => svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
const assertNoDuplicateAttributes = (root, label) => {
  const names = [...root.matchAll(/\s([\w:-]+)(?:=|\s|>)/g)].map(([, name]) => name);
  assert.equal(new Set(names).size, names.length, `${label}: 属性が重複 ${root}`);
};

try {
  const page = join(fixtureDir, 'src/pages/index.astro');
  await mkdir(dirname(page), { recursive: true });
  await writeFile(
    join(fixtureDir, 'src/External.astro'),
    `---
const { strokeWidth = 7, weight, ...props } = Astro.props;
---
<svg stroke-width={strokeWidth} data-weight={weight} {...props}><path d="M0 0L24 24" /></svg>
`
  );
  await writeFile(
    page,
    `---
import { Icon } from 'lism-css/astro';
import External from '../External.astro';
const svgInput = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M0 0L24 24" /></svg>';
---
<html><body>
<Icon icon={svgInput} data-case="svg-input" />
<Icon icon={svgInput} weight="bold" data-case="bold" />
<Icon icon={svgInput} weight="bold" strokeWidth={0.5} data-case="camel" />
<Icon icon={svgInput} weight="bold" strokeWidth={0.5} stroke-width={0.75} data-case="native" />
<Icon icon={svgInput} weight="bold" strokeWidth={0.5} exProps={{ 'stroke-width': 3 }} data-case="exProps" />
<Icon icon={svgInput} size="2em" width="3em" height="4em" data-case="size" />
<Icon icon={svgInput} size="2em" data-case="size-only" />
<Icon icon={External} label="外部アイコン" class="consumer-icon" data-case="external" />
<Icon icon={External} weight="light" data-case="external-light" />
<Icon as={External} weight="duotone" data-case="external-duotone" />
<Icon icon={{ as: External, weight: 'fill' }} weight="light" exProps={{ weight: 'duotone' }} data-case="external-exProps" />
<Icon icon={'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 0L24 24" /></svg>'} data-case="raw" />
</body></html>
`
  );
  await build({ root: pathToFileURL(`${fixtureDir}/`), configFile: false, logLevel: 'silent' });
  const html = await readFile(join(fixtureDir, 'dist/index.html'), 'utf8');
  const svgs = [...html.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/g)].map(([svg]) => svg);
  const find = (attribute, value) => {
    const svg = svgs.find((candidate) => rootTag(candidate).includes(`${attribute}="${value}"`));
    assert.ok(svg, `${attribute}=${value}`);
    return svg;
  };
  const inputSvg = find('data-case', 'svg-input');
  const inputRoot = rootTag(inputSvg);
  for (const attribute of ['fill="none"', 'stroke="currentColor"', 'stroke-width="1.5"', 'viewBox="0 0 24 24"', 'class="a--icon"']) {
    assert.ok(inputRoot.includes(attribute), attribute);
  }
  assert.doesNotMatch(inputRoot, /\b(?:body|weight|strokeWidth|strokeLinecap|strokeLinejoin)=/);
  assertNoDuplicateAttributes(inputRoot, 'svg-input');
  assert.match(inputSvg, /<path\b/);
  for (const [name, width] of Object.entries({
    bold: '1.5',
    camel: '0.5',
    native: '0.75',
    exProps: '3',
    external: '7',
    'external-light': '7',
    'external-duotone': '7',
    'external-exProps': '7',
    raw: '2',
  })) {
    const root = rootTag(find('data-case', name));
    assert.ok(root.includes(`stroke-width="${width}"`), `${name}: ${root}`);
    assert.doesNotMatch(root, /\s(?:weight|strokeWidth)=/);
  }
  for (const [name, weight] of Object.entries({ 'external-light': 'light', 'external-duotone': 'duotone', 'external-exProps': 'duotone' })) {
    assert.ok(rootTag(find('data-case', name)).includes(`data-weight="${weight}"`), name);
  }
  const size = rootTag(find('data-case', 'size'));
  assert.match(size, /width="3em"/);
  assert.match(size, /height="4em"/);
  assertNoDuplicateAttributes(size, 'size');
  const sizeOnly = rootTag(find('data-case', 'size-only'));
  assert.match(sizeOnly, /width="2em"/);
  assert.match(sizeOnly, /height="2em"/);
  assertNoDuplicateAttributes(sizeOnly, 'size-only');
  const external = rootTag(find('data-case', 'external'));
  assert.match(external, /aria-label="外部アイコン"/);
  assert.match(external, /role="img"/);
  const classes = external.match(/class="([^"]*)"/)?.[1].split(/\s+/) ?? [];
  assert.ok(classes.includes('a--icon'));
  assert.ok(classes.includes('consumer-icon'));
  assert.match(rootTag(find('data-case', 'raw')), /fill="none"/);
  console.log('Astro: SVG文字列・線幅指定・外部SVGの描画を検証しました');
} finally {
  await rm(fixtureDir, { recursive: true, force: true });
}
