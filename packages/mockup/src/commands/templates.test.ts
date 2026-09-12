import path from 'node:path';
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';

import { cleanupTempDirs, createTempDir } from '../test-helpers/fixtures.js';
import { cleanupSharedDirs, trackCheckedDir } from '../test-helpers/shared-dirs.js';
import { checkCommand } from './check.js';
import { initCommand } from './init.js';

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  cleanupSharedDirs();
  cleanupTempDirs();
});

describe('init templates', () => {
  test('init した templates をそのまま check に通せる', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const dir = trackCheckedDir(path.join(createTempDir(), 'mockup'));
    await initCommand(dir, { force: false });

    await expect(checkCommand(dir)).resolves.toBeUndefined();

    const output = log.mock.calls.map((args) => String(args[0])).join('\n');
    expect(output).toContain('check passed');
    expect(output).toContain('landing');
    expect(output).toContain('components');
  }, 60_000);
});
