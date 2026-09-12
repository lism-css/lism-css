import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { generate } from './generate.mjs';

async function snapshot(root) {
  const result = {};
  for (const file of await readdir(root, { recursive: true, withFileTypes: true })) {
    if (file.isFile()) result[join(file.parentPath, file.name)] = await readFile(join(file.parentPath, file.name), 'utf8');
  }
  return result;
}

test('生成、check、余剰ファイル整理と不正入力時の非破壊性', async () => {
  const root = await mkdtemp(join(tmpdir(), 'lism-icons-generate-'));
  try {
    await mkdir(join(root, 'src/svg'), { recursive: true });
    const svg = '<svg viewBox="0 0 24 24"><path d="M1 2L3 4" fill="none" stroke="black" stroke-width="1.5"/></svg>';
    await writeFile(join(root, 'src/svg/home.svg'), svg);
    assert.equal(await generate({ root }), 5);
    assert.equal(await generate({ root, check: true }), 5);
    assert.match(await readFile(join(root, 'src/data.ts'), 'utf8'), /coreIconNames = \['home'\]/);
    const stale = join(root, 'src/react/OldIcon.tsx');
    await cp(join(root, 'src/react/Home.tsx'), stale);
    const withStale = await snapshot(root);
    await assert.rejects(generate({ root, check: true }), /OldIcon/);
    assert.deepEqual(await snapshot(root), withStale);
    await generate({ root });
    await assert.rejects(readFile(stale), { code: 'ENOENT' });

    const source = join(root, 'src/svg/home.svg');
    const valid = await readFile(source, 'utf8');
    await writeFile(source, '<svg><script>alert(1)</script></svg>');
    const invalid = await snapshot(root);
    await assert.rejects(generate({ root }));
    assert.deepEqual(await snapshot(root), invalid);
    await writeFile(source, valid);

    await writeFile(join(root, 'src/svg/unknown.svg'), valid);
    assert.equal(await generate({ root }), 7);
    await rm(source);
    assert.equal(await generate({ root }), 5);
    await assert.rejects(readFile(join(root, 'src/react/Home.tsx')), { code: 'ENOENT' });
    await assert.rejects(readFile(join(root, 'packages/astro/Home.astro')), { code: 'ENOENT' });
    assert.match(await readFile(join(root, 'src/data.ts'), 'utf8'), /coreIconNames = \[\]/);
    const generated = await snapshot(root);
    await generate({ root });
    assert.deepEqual(await snapshot(root), generated);
    await generate({ root, check: true });

    await writeFile(join(root, 'src/svg/Invalid.svg'), valid);
    const invalidName = await snapshot(root);
    await assert.rejects(generate({ root }), /ファイル名/);
    assert.deepEqual(await snapshot(root), invalidName);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
