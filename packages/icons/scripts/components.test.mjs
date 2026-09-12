import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build as bundle } from 'esbuild';
import { build as buildAstro } from 'astro';
import * as components from '@lism-css/icons/react';
import Home from '@lism-css/icons/react/Home';
import { icons as data } from '@lism-css/icons/data';
import { readSvgIcons, packageDir } from './config.mjs';
import { normalizeSvg } from './normalize-svg.mjs';

const icons = await Promise.all(
  (await readSvgIcons(join(packageDir, 'src/svg'))).map(async ({ id }) => ({
    id,
    ...normalizeSvg(await readFile(join(packageDir, `src/svg/${id}.svg`), 'utf8'), { id }),
  }))
);

const componentName = (id) =>
  id
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
const render = (Component, props, children) => renderToStaticMarkup(createElement(Component, props, children));
const svgRoot = (html) => html.match(/<svg\b[^>]*>/)?.[0] ?? '';
const assertNoDuplicateAttributes = (root, label) => {
  const names = [...root.matchAll(/\s([\w:-]+)(?:=|\s|>)/g)].map(([, name]) => name);
  assert.equal(new Set(names).size, names.length, `${label}: 属性が重複 ${root}`);
};
const svgBody = (html) =>
  html
    .slice(html.indexOf('>') + 1, html.lastIndexOf('</svg>'))
    .replace(/><\/(path|circle|rect|ellipse|line|polygon|polyline)>/g, '/>')
    .replace(/>\s+</g, '><')
    .trim();

test('全SVGのReact公開コンポーネントをSSRでき、形状と属性を保持する', () => {
  assert.equal(Object.keys(components).length, icons.length);
  assert.equal(Object.keys(data).length, icons.length);
  for (const icon of icons) {
    const html = render(components[componentName(icon.id)]);
    const root = svgRoot(html);
    assert.match(root, /viewBox="0 0 24 24"/);
    assert.match(root, /width="1em" height="1em"/);
    assert.match(root, /aria-hidden="true"/);
    assert.equal(svgBody(html), icon.body);
    for (const [key, value] of Object.entries(icon.attributes)) assert.ok(root.includes(`${key}="${value}"`), `${icon.id}: ${key}`);
    assert.deepEqual(data[icon.id], { viewBox: icon.viewBox, attributes: icon.attributes, body: icon.body });
  }
});

test('Reactの個別importで利用者の属性・title・アクセシビリティ指定が有効になる', () => {
  assert.equal(Home, components.Home);
  const html = render(
    Home,
    { strokeWidth: 2, width: 32, className: 'icon', 'data-test': 'home', 'aria-labelledby': 'home-title' },
    createElement('title', { id: 'home-title' }, 'ホーム')
  );
  const root = svgRoot(html);
  for (const attribute of ['stroke-width="2"', 'width="32"', 'class="icon"', 'data-test="home"', 'aria-labelledby="home-title"', 'role="img"'])
    assert.ok(root.includes(attribute), attribute);
  assert.doesNotMatch(root, /aria-hidden=/);
  assert.match(html, /<title id="home-title">ホーム<\/title>/);
  assert.match(svgRoot(render(Home, { 'aria-hidden': false })), /aria-hidden="false"/);
  const sized = svgRoot(render(Home, { size: 32 }));
  assert.match(sized, /width="32" height="32"/);
  assert.doesNotMatch(sized, /\bsize=/);
  assert.match(svgRoot(render(Home, { size: 32, height: '2em' })), /width="32" height="2em"/);
  assert.match(svgRoot(render(Home, { 'aria-label': 'ホーム' })), /role="img"/);
});

test('barrelからHomeだけをbundleすると他のアイコンの形状を含まない', async () => {
  const result = await bundle({
    stdin: { contents: 'export { Home } from "@lism-css/icons/react";', resolveDir: packageDir },
    bundle: true,
    write: false,
    format: 'esm',
    minify: true,
    external: ['react', 'react/*'],
    metafile: true,
  });
  const output = result.outputFiles[0].text;
  assert.ok(output.length > 0);
  const retained = Object.values(result.metafile.outputs)[0].inputs;
  assert.equal(Object.keys(retained).filter((path) => /dist\/react\/[^/]+\.js$/.test(path) && retained[path].bytesInOutput > 0).length, 1);
});

test('Astroで全SVG・個別import・線幅の両記法・slotを実際にビルドできる', async () => {
  const cacheDir = join(packageDir, '.cache');
  await mkdir(cacheDir, { recursive: true });
  const fixtureDir = await mkdtemp(join(cacheDir, 'components-'));
  try {
    await mkdir(join(fixtureDir, 'src/pages'), { recursive: true });
    await writeFile(
      join(fixtureDir, 'src/pages/index.astro'),
      `---
import * as Icons from '@lism-css/icons/astro';
import Home from '@lism-css/icons/astro/Home';
---
<html><body>
{Object.entries(Icons).map(([name, Component]) => <Component data-icon={name} />)}
<Home data-case="alias" strokeWidth={2} width={32} class="icon" aria-labelledby="home-title"><title id="home-title">ホーム</title></Home>
<Home data-case="native" stroke-width={1} strokeWidth={2} aria-label="ホーム" />
<Home data-case="visible" aria-hidden={false} />
<Home data-case="sized" width="2.5em" height="2.5em" focusable="true" role="presentation" />
<Home data-case="size" size="2em" height="3em" />
</body></html>`
    );
    await buildAstro({ root: pathToFileURL(`${fixtureDir}/`), configFile: false, logLevel: 'silent' });
    const html = await readFile(join(fixtureDir, 'dist/index.html'), 'utf8');
    const svgs = [...html.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/g)].map(([svg]) => svg);
    assert.equal(svgs.length, icons.length + 5);
    for (const icon of icons) {
      const svg = svgs.find((value) => svgRoot(value).includes(`data-icon="${componentName(icon.id)}"`));
      assert.ok(svg, icon.id);
      assert.match(svgRoot(svg), /aria-hidden="true"/);
      assertNoDuplicateAttributes(svgRoot(svg), icon.id);
      for (const [key, value] of Object.entries(icon.attributes)) assert.ok(svgRoot(svg).includes(`${key}="${value}"`), `${icon.id}: ${key}`);
      assert.equal(svgBody(svg), icon.body);
    }
    const alias = svgs.find((svg) => svgRoot(svg).includes('data-case="alias"'));
    for (const attribute of ['stroke-width="2"', 'width="32"', 'class="icon"', 'aria-labelledby="home-title"', 'role="img"'])
      assert.ok(svgRoot(alias).includes(attribute), attribute);
    assert.doesNotMatch(svgRoot(alias), /aria-hidden=/);
    assert.match(alias, /<title id="home-title">ホーム<\/title>/);
    const native = svgs.find((svg) => svgRoot(svg).includes('data-case="native"'));
    assert.match(svgRoot(native), /stroke-width="1"/);
    assert.match(svgRoot(native), /role="img"/);
    assert.doesNotMatch(svgRoot(native), /aria-hidden=|strokeWidth=/);
    assert.match(svgRoot(svgs.find((svg) => svgRoot(svg).includes('data-case="visible"'))), /aria-hidden="false"/);
    const sizeCase = svgRoot(svgs.find((svg) => svgRoot(svg).includes('data-case="size"')));
    assert.match(sizeCase, /width="2em"/);
    assert.match(sizeCase, /height="3em"/);
    assert.doesNotMatch(sizeCase, /\bsize=/);
    for (const name of ['alias', 'native', 'visible', 'sized', 'size']) {
      assertNoDuplicateAttributes(svgRoot(svgs.find((svg) => svgRoot(svg).includes(`data-case="${name}"`))), name);
    }
    const sized = svgRoot(svgs.find((svg) => svgRoot(svg).includes('data-case="sized"')));
    for (const attribute of ['width="2.5em"', 'height="2.5em"', 'focusable="true"', 'role="presentation"'])
      assert.ok(sized.includes(attribute), attribute);
  } finally {
    await rm(fixtureDir, { recursive: true, force: true });
  }
});
