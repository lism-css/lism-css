import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'astro';

const cacheDir = fileURLToPath(new URL('../.cache/', import.meta.url));
await mkdir(cacheDir, { recursive: true });
const fixtureDir = await mkdtemp(join(cacheDir, 'verify-icons-'));
try {
  await mkdir(join(fixtureDir, 'src/pages'), { recursive: true });
  await writeFile(
    join(fixtureDir, 'src/pages/index.astro'),
    `---
import { Alert } from '@lism-css/ui/astro/Alert';
import { Callout } from '@lism-css/ui/astro/Callout';
import { Modal } from '@lism-css/ui/astro/Modal';
import { Popover } from '@lism-css/ui/astro/Popover';
const types = ['alert', 'point', 'tip', 'warning', 'check', 'help', 'info', 'note', 'unknown'];
---
<html><body>
{types.map((type) => <Alert type={type}>Body</Alert>)}
{types.map((type) => <Callout type={type} title="Title">Body</Callout>)}
<Modal.CloseBtn />
<Popover.Close />
</body></html>
`
  );
  await build({ root: pathToFileURL(`${fixtureDir}/`), configFile: false, logLevel: 'silent' });
  const html = await readFile(join(fixtureDir, 'dist/index.html'), 'utf8');
  const svgs = [...html.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/g)].map(([svg]) => svg);
  assert.equal(svgs.length, 20);
  for (const svg of svgs) {
    assert.match(svg, /aria-hidden="true"/);
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.match(svg, /stroke="currentColor"/);
    assert.match(svg, /<(?:path|circle|line|polyline|polygon|rect)\b/);
  }
  console.log('Astro: Alert・Callout・Modal・Popoverの既定SVGを検証しました');
} finally {
  await rm(fixtureDir, { recursive: true, force: true });
}
