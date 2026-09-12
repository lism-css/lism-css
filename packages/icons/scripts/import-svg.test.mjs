import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { importSvg } from './import-svg.mjs';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 3L21 21" fill="none" stroke="#282b35" stroke-width="1.5"/></svg>';
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'lism-import-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = join(root, 'input');
  const target = join(root, 'svg');
  await mkdir(input);
  await mkdir(target);
  await writeFile(join(target, 'old.svg'), svg);
  await writeFile(join(target, 'notes.txt'), 'keep');
  return { input, target };
}

test('import replaces the exported set and preserves other files', async (t) => {
  const { input, target } = await fixture(t);
  await writeFile(join(input, 'new.svg'), svg);
  assert.equal(await importSvg(input, target), 1);
  assert.deepEqual((await readdir(target)).sort(), ['new.svg', 'notes.txt']);
  assert.equal(await readFile(join(target, 'new.svg'), 'utf8'), svg);
  assert.equal(await readFile(join(target, 'notes.txt'), 'utf8'), 'keep');
  await writeFile(join(input, 'another.svg'), svg);
  assert.equal(await importSvg(input, target), 2);
  await rm(join(input, 'new.svg'));
  assert.equal(await importSvg(input, target), 1);
  assert.deepEqual((await readdir(target)).sort(), ['another.svg', 'notes.txt']);
});

test('invalid or empty export never replaces the current package SVGs', async (t) => {
  const { input, target } = await fixture(t);
  await assert.rejects(importSvg(input, target));
  await writeFile(join(input, 'invalid.svg'), svg.replace('0 0 24 24', '0 0 48 48'));
  await assert.rejects(importSvg(input, target));
  assert.deepEqual((await readdir(target)).sort(), ['notes.txt', 'old.svg']);
  assert.equal(await readFile(join(target, 'old.svg'), 'utf8'), svg);
});
