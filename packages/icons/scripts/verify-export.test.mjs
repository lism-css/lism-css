import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { verify } from './verify-export.mjs';

const svg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#2b303b"/></svg>';

test('SVGの追加・削除・任意形状を受け入れ、名前順で検証結果を返す', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'lism-icons-verify-'));
  try {
    await writeFile(join(directory, 'z-new.svg'), svg);
    await writeFile(join(directory, 'alert.svg'), svg);
    const result = await verify(directory);
    assert.deepEqual(
      result.map(({ id }) => id),
      ['alert', 'z-new']
    );
    assert.ok(result.every(({ data }) => data.kind === 'fill'));
    await rm(join(directory, 'alert.svg'));
    assert.deepEqual(
      (await verify(directory)).map(({ id }) => id),
      ['z-new']
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('空の入力・安全でない名前・コンポーネント名の衝突・不正なSVGを拒否する', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'lism-icons-invalid-'));
  try {
    await assert.rejects(verify(directory), /SVGがありません/);
    for (const name of ['.svg', 'Upper.svg', '1icon.svg', 'icon--one.svg', 'icon.SVG']) {
      await writeFile(join(directory, name), svg);
      await assert.rejects(verify(directory), /ファイル名/);
      await rm(join(directory, name));
    }
    await writeFile(join(directory, 'icon-2.svg'), svg);
    await writeFile(join(directory, 'icon2.svg'), svg);
    await assert.rejects(verify(directory), /重複/);
    await rm(join(directory, 'icon-2.svg'));
    await writeFile(join(directory, 'icon2.svg'), svg.replace('0 0 24 24', '0 0 16 16'));
    await assert.rejects(verify(directory), /viewBox/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
