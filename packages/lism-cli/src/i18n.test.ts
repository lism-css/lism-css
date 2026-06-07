import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import { detectLang, getLang, setLang, preScanLang, t, tOf } from './i18n';
import type { MessageKey } from './messages';

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn(),
}));

const mockedExecFileSync = vi.mocked(execFileSync);

const originalPlatform = process.platform;
function setPlatform(platform: NodeJS.Platform): void {
  Object.defineProperty(process, 'platform', { value: platform, configurable: true });
}

function mockIntlLocale(locale: string) {
  return vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({ resolvedOptions: () => ({ locale }) }) as unknown as Intl.DateTimeFormat);
}

describe('detectLang', () => {
  beforeEach(() => {
    vi.stubEnv('LC_ALL', '');
    vi.stubEnv('LANG', '');
    mockedExecFileSync.mockReset();
    // 既定では macOS 以外として AppleLanguages 経路を無効化する
    setPlatform('linux');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    setPlatform(originalPlatform);
  });

  it('override が "ja" のときはそのまま返す', () => {
    expect(detectLang('ja')).toBe('ja');
  });

  it('override が "en" のときはそのまま返す', () => {
    expect(detectLang('en')).toBe('en');
  });

  it('無効な override は無視し、環境変数を見る', () => {
    vi.stubEnv('LANG', 'ja_JP.UTF-8');
    expect(detectLang('xx')).toBe('ja');
  });

  it('LC_ALL が ja* のときは ja', () => {
    vi.stubEnv('LC_ALL', 'ja_JP.UTF-8');
    expect(detectLang()).toBe('ja');
  });

  it('LANG が ja* のときは ja', () => {
    vi.stubEnv('LANG', 'ja');
    expect(detectLang()).toBe('ja');
  });

  it('macOS で LANG が英語でも AppleLanguages 先頭が ja* なら ja', () => {
    vi.stubEnv('LC_ALL', 'en_US.UTF-8');
    setPlatform('darwin');
    mockedExecFileSync.mockReturnValue('(\n    "ja-JP",\n    "en-JP"\n)\n');
    expect(detectLang()).toBe('ja');
    expect(mockedExecFileSync).toHaveBeenCalledWith('/usr/bin/defaults', ['read', '-g', 'AppleLanguages'], expect.anything());
  });

  it('macOS で AppleLanguages 先頭が en* なら ja にはしない', () => {
    vi.stubEnv('LC_ALL', 'en_US.UTF-8');
    setPlatform('darwin');
    mockedExecFileSync.mockReturnValue('(\n    "en-US",\n    "ja-JP"\n)\n');
    const spy = mockIntlLocale('en-US');
    try {
      expect(detectLang()).toBe('en');
    } finally {
      spy.mockRestore();
    }
  });

  it('macOS で defaults コマンドが失敗しても Intl 判定にフォールバックする', () => {
    vi.stubEnv('LC_ALL', 'en_US.UTF-8');
    setPlatform('darwin');
    mockedExecFileSync.mockImplementation(() => {
      throw new Error('defaults: command not found');
    });
    const spy = mockIntlLocale('ja-JP');
    try {
      expect(detectLang()).toBe('ja');
    } finally {
      spy.mockRestore();
    }
  });

  it('macOS 以外では AppleLanguages を参照しない', () => {
    vi.stubEnv('LC_ALL', 'en_US.UTF-8');
    setPlatform('linux');
    mockedExecFileSync.mockReturnValue('(\n    "ja-JP"\n)\n');
    const spy = mockIntlLocale('en-US');
    try {
      expect(detectLang()).toBe('en');
      expect(mockedExecFileSync).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it('LC_ALL / LANG が英語でも Intl が ja* ならフォールバックで ja', () => {
    vi.stubEnv('LC_ALL', 'en_US.UTF-8');
    const spy = mockIntlLocale('ja-JP');
    try {
      expect(detectLang()).toBe('ja');
    } finally {
      spy.mockRestore();
    }
  });

  it('どこからも ja が引けない場合は en', () => {
    vi.stubEnv('LC_ALL', 'en_US.UTF-8');
    const spy = mockIntlLocale('en-US');
    try {
      expect(detectLang()).toBe('en');
    } finally {
      spy.mockRestore();
    }
  });
});

describe('preScanLang', () => {
  beforeEach(() => {
    setLang('en');
  });

  it('--lang ja で ja に切り替わる', () => {
    preScanLang(['node', 'lism', '--lang', 'ja']);
    expect(getLang()).toBe('ja');
  });

  it('--lang=ja で ja に切り替わる', () => {
    preScanLang(['--lang=ja']);
    expect(getLang()).toBe('ja');
  });

  it('--lang のあとが別オプション（-- で始まる）の場合は無視', () => {
    preScanLang(['--lang', '--force']);
    expect(getLang()).toBe('en');
  });

  it('--lang のあとに値がない場合は無視', () => {
    preScanLang(['--lang']);
    expect(getLang()).toBe('en');
  });

  it('無効値（ja/en 以外）は setLang 側で無視される', () => {
    preScanLang(['--lang', 'zh']);
    expect(getLang()).toBe('en');
  });

  it('--lang 関連の引数がない場合は状態が保たれる', () => {
    setLang('ja');
    preScanLang(['create', 'my-app', '--template', 'minimal-astro']);
    expect(getLang()).toBe('ja');
  });
});

describe('t()', () => {
  beforeEach(() => {
    setLang('en');
  });

  it('現在の言語に応じたメッセージを返す', () => {
    setLang('en');
    expect(t('common.done')).toBe('Done.');
    setLang('ja');
    expect(t('common.done')).toBe('完了しました。');
  });

  it('{name} プレースホルダを vars で置換する', () => {
    setLang('ja');
    expect(t('create.created', { dir: '/tmp/foo' })).toBe('/tmp/foo にプロジェクトを生成しました。');
  });

  it('vars で渡されなかったプレースホルダは {name} のまま残す', () => {
    setLang('ja');
    expect(t('create.created')).toBe('{dir} にプロジェクトを生成しました。');
  });

  it('未知のキーはキー名をそのまま返す', () => {
    expect(t('nonexistent.key' as MessageKey)).toBe('nonexistent.key');
  });
});

describe('tOf()', () => {
  it('現在の言語に応じた値を返す', () => {
    setLang('ja');
    expect(tOf({ ja: 'あ', en: 'A' })).toBe('あ');
    setLang('en');
    expect(tOf({ ja: 'あ', en: 'A' })).toBe('A');
  });
});
