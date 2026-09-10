import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'astro';
import presets from 'lism-css/react/atomic/Icon/presets';

const packageDir = fileURLToPath(new URL('../', import.meta.url));
const cacheDir = join(packageDir, '.cache');
await mkdir(cacheDir, { recursive: true });
const fixtureDir = await mkdtemp(join(cacheDir, 'verify-icon-'));
const rootTag = (svg) => svg.match(/<svg\b[^>]*>/)?.[0] ?? '';

try {
  const page = join(fixtureDir, 'src/pages/index.astro');
  await mkdir(dirname(page), { recursive: true });
  await writeFile(
    join(fixtureDir, 'src/External.astro'),
    `---
const { strokeWidth = 7, ...props } = Astro.props;
---
<svg stroke-width={strokeWidth} {...props}><path d="M0 0L24 24" /></svg>
`
  );
  const alertPath = relative(dirname(page), join(packageDir, '../lism-ui/src/components/Alert/astro/Alert.astro'));
  const calloutPath = relative(dirname(page), join(packageDir, '../lism-ui/src/components/Callout/astro/Callout.astro'));
  await writeFile(
    page,
    `---
import { Icon } from 'lism-css/astro';
import presets from 'lism-css/react/atomic/Icon/presets';
import External from '../External.astro';
import Alert from ${JSON.stringify(alertPath)};
import Callout from ${JSON.stringify(calloutPath)};
---
<html><body>
{Object.keys(presets).map((icon) => <Icon icon={icon} data-icon={icon} />)}
{['light', 'regular', 'bold'].map((weight) => <Icon icon="home" weight={weight} data-case={weight} />)}
<Icon icon="home" weight="bold" strokeWidth={0.5} data-case="camel" />
<Icon icon="home" weight="bold" strokeWidth={0.5} stroke-width={0.75} data-case="native" />
<Icon icon="home" weight="bold" strokeWidth={0.5} exProps={{ 'stroke-width': 3 }} data-case="exProps" />
<Icon icon="home" size="2em" width="3em" height="4em" data-case="size" />
<Icon icon={External} label="外部アイコン" class="consumer-icon" data-case="external" />
<Icon icon={External} weight="light" data-case="external-light" />
<Icon icon={'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 0L24 24" /></svg>'} data-case="raw" />
<Alert type="info" data-case="alert">通知</Alert>
<Callout title="メモ" data-case="callout">説明</Callout>
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
  assert.equal(Object.keys(presets).length, 34);
  for (const icon of Object.keys(presets)) {
    const svg = find('data-icon', icon);
    const root = rootTag(svg);
    for (const attribute of ['fill="none"', 'stroke="currentColor"', 'stroke-width="1.5"', 'viewBox="0 0 24 24"', 'class="a--icon"']) {
      assert.ok(root.includes(attribute), `${icon}: ${attribute}`);
    }
    assert.doesNotMatch(root, /\b(?:body|weight|strokeWidth|strokeLinecap|strokeLinejoin)=/);
    assert.match(svg, /<(?:path|circle|rect|line|polyline|polygon|ellipse)\b/);
  }
  for (const [name, width] of Object.entries({
    light: '1',
    regular: '1.5',
    bold: '2',
    camel: '0.5',
    native: '0.75',
    exProps: '3',
    external: '7',
    'external-light': '1',
    raw: '2',
  })) {
    const root = rootTag(find('data-case', name));
    assert.ok(root.includes(`stroke-width="${width}"`), `${name}: ${root}`);
    assert.doesNotMatch(root, /\b(?:weight|strokeWidth)=/);
  }
  const size = rootTag(find('data-case', 'size'));
  assert.match(size, /width="3em"/);
  assert.match(size, /height="4em"/);
  const external = rootTag(find('data-case', 'external'));
  assert.match(external, /aria-label="外部アイコン"/);
  assert.match(external, /role="img"/);
  const classes = external.match(/class="([^"]*)"/)?.[1].split(/\s+/) ?? [];
  assert.ok(classes.includes('a--icon'));
  assert.ok(classes.includes('consumer-icon'));
  assert.match(rootTag(find('data-case', 'raw')), /fill="none"/);
  for (const [consumer, icon] of [
    ['alert', 'info'],
    ['callout', 'note'],
  ]) {
    const start = html.indexOf(`data-case="${consumer}"`);
    assert.ok(start >= 0, consumer);
    const svg = html.slice(start).match(/<svg\b[^>]*>[\s\S]*?<\/svg>/)?.[0];
    assert.ok(svg, consumer);
    assert.match(rootTag(svg), /stroke-width="1.5"/);
    assert.ok(svg.includes(presets[icon].body), `${consumer}: ${icon}の形状`);
  }
  console.log('Astro: コア34種・線幅指定・外部SVG・Alert/Calloutの描画を検証しました');
} finally {
  await rm(fixtureDir, { recursive: true, force: true });
}
