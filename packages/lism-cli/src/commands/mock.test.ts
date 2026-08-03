import { describe, expect, it, vi } from 'vitest';
import { setLang } from '../i18n';
import { logger } from '../logger';
import { mockCommand } from './mock';

describe('mockCommand', () => {
  it('@lism-css/mock の実行コマンドを案内する（ja）', () => {
    setLang('ja');
    const logSpy = vi.spyOn(logger, 'log').mockImplementation(() => undefined);

    mockCommand();

    expect(logSpy).toHaveBeenCalledTimes(1);
    const message = logSpy.mock.calls[0][0];
    expect(message).toContain('@lism-css/mock');
    expect(message).toContain('npx @lism-css/mock init [dir]');
    expect(message).toContain('npx @lism-css/mock dev [dir]');
    expect(message).toContain('npx @lism-css/mock check [dir]');
    expect(message).toContain('lism-mock');

    logSpy.mockRestore();
  });

  it('@lism-css/mock の実行コマンドを案内する（en）', () => {
    setLang('en');
    const logSpy = vi.spyOn(logger, 'log').mockImplementation(() => undefined);

    mockCommand();

    expect(logSpy).toHaveBeenCalledTimes(1);
    const message = logSpy.mock.calls[0][0];
    expect(message).toContain('@lism-css/mock');
    expect(message).toContain('npx @lism-css/mock init [dir]');
    expect(message).toContain('npx @lism-css/mock dev [dir]');
    expect(message).toContain('npx @lism-css/mock check [dir]');
    expect(message).toContain('lism-mock');

    logSpy.mockRestore();
    setLang('ja');
  });
});
