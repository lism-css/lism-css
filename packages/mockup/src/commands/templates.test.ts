import fs from 'node:fs';
import path from 'node:path';
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';

import { resolveGeneratedConfigDir, resolveViteCacheDir } from '../core/runtime.js';
import { cleanupTempDirs, createTempDir } from '../test-helpers/fixtures.js';
import { checkCommand } from './check.js';
import { initCommand } from './init.js';

const checkedDirs: string[] = [];

function readImports(dir: string): string[] {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, 'mockup.config.json'), 'utf-8')) as { imports?: string[] };
    return Array.isArray(raw.imports) ? raw.imports : [];
  } catch {
    return [];
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  for (const dir of checkedDirs) {
    if (!fs.existsSync(dir)) continue;
    const real = fs.realpathSync(dir);
    const imports = readImports(real);
    for (const shared of [resolveViteCacheDir(real, imports), resolveGeneratedConfigDir(real, imports)]) {
      fs.rmSync(shared, { recursive: true, force: true });
    }
  }
  cleanupTempDirs();
});

describe('init templates', () => {
  test('init した templates をそのまま check に通せる', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const dir = path.join(createTempDir(), 'mockup');
    await initCommand(dir, { force: false });
    checkedDirs.push(dir);

    await expect(checkCommand(dir)).resolves.toBeUndefined();

    const output = log.mock.calls.map((args) => String(args[0])).join('\n');
    expect(output).toContain('check passed');
    expect(output).toContain('landing');
    expect(output).toContain('components');
  }, 60_000);
});
