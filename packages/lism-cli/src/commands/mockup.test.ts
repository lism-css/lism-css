import { describe, expect, it, vi } from 'vitest';
import { setLang } from '../i18n';
import { logger } from '../logger';
import { mockupCommand } from './mockup';

describe('mockupCommand', () => {
  it('@lism-css/mockup の実行コマンドを案内する（ja）', () => {
    setLang('ja');
    const logSpy = vi.spyOn(logger, 'log').mockImplementation(() => undefined);

    mockupCommand();

    expect(logSpy).toHaveBeenCalledTimes(1);
    const message = logSpy.mock.calls[0][0];
    expect(message).toContain('@lism-css/mockup');
    expect(message).toContain('npx @lism-css/mockup init [dir]');
    expect(message).toContain('npx @lism-css/mockup dev [dir]');
    expect(message).toContain('npx @lism-css/mockup check [dir]');
    expect(message).toContain('lism-mockup');

    logSpy.mockRestore();
  });

  it('@lism-css/mockup の実行コマンドを案内する（en）', () => {
    setLang('en');
    const logSpy = vi.spyOn(logger, 'log').mockImplementation(() => undefined);

    mockupCommand();

    expect(logSpy).toHaveBeenCalledTimes(1);
    const message = logSpy.mock.calls[0][0];
    expect(message).toContain('@lism-css/mockup');
    expect(message).toContain('npx @lism-css/mockup init [dir]');
    expect(message).toContain('npx @lism-css/mockup dev [dir]');
    expect(message).toContain('npx @lism-css/mockup check [dir]');
    expect(message).toContain('lism-mockup');

    logSpy.mockRestore();
    setLang('ja');
  });
});
