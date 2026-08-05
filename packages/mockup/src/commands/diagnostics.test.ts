import { afterEach, describe, expect, test, vi } from 'vitest';

import { warnMissingStandardPackages } from './diagnostics.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('warnMissingStandardPackages', () => {
  test('欠落した標準パッケージ名と直し方を標準エラー出力へ出す', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    warnMissingStandardPackages(['react', '@lism-css/ui']);

    const output = error.mock.calls.map((args) => String(args[0])).join('\n');
    expect(output).toContain('"react"');
    expect(output).toContain('"@lism-css/ui"');
    expect(output).toContain('Reinstall @lism-css/mockup');
  });

  test('欠落が無ければ何も出さない', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    warnMissingStandardPackages([]);

    expect(error).not.toHaveBeenCalled();
  });
});
