// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { buildConfigAwareKnown } from './shared';

const dirs: string[] = [];
function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-known-'));
  dirs.push(dir);
  return dir;
}
afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

describe('buildConfigAwareKnown', () => {
  test('custom prop 由来のクラスを known に含める', async () => {
    const root = tmpDir();
    fs.writeFileSync(path.join(root, 'lism.config.js'), 'export default { props: { myz: { prop: "zIndex", utils: { "9": "9" } } } };\n');

    const known = await buildConfigAwareKnown(root);
    expect(known).toBeDefined();
    expect([...known!.classes].some((cls) => cls.startsWith('-myz'))).toBe(true);
  }, 15000);

  test('壊れた config では例外を漏らさず undefined を返す', async () => {
    const root = tmpDir();
    fs.writeFileSync(path.join(root, 'lism.config.js'), 'export default { this is not valid javascript');

    await expect(buildConfigAwareKnown(root)).resolves.toBeUndefined();
  });
});
