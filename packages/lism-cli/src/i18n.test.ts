import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectLang, getLang, setLang, preScanLang, t, tOf } from './i18n';
import type { MessageKey } from './messages';

describe('detectLang', () => {
  beforeEach(() => {
    vi.stubEnv('LC_ALL', '');
    vi.stubEnv('LANG', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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

  it('LC_ALL / LANG が英語でも Intl が ja* ならフォールバックで ja', () => {
    vi.stubEnv('LC_ALL', 'en_US.UTF-8');
    const spy = vi
      .spyOn(Intl, 'DateTimeFormat')
      .mockImplementation(() => ({ resolvedOptions: () => ({ locale: 'ja-JP' }) }) as unknown as Intl.DateTimeFormat);
    try {
      expect(detectLang()).toBe('ja');
    } finally {
      spy.mockRestore();
    }
  });

  it('どこからも ja が引けない場合は en', () => {
    vi.stubEnv('LC_ALL', 'en_US.UTF-8');
    const spy = vi
      .spyOn(Intl, 'DateTimeFormat')
      .mockImplementation(() => ({ resolvedOptions: () => ({ locale: 'en-US' }) }) as unknown as Intl.DateTimeFormat);
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
    preScanLang(['create', 'my-app', '--template', 'astro-minimal']);
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
