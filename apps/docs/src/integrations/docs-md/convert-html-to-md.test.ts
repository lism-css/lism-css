import { describe, it, expect } from 'vitest';
import { unescapeGfmAlerts, yamlString } from './convert-html-to-md';

describe('unescapeGfmAlerts', () => {
  it('既知の Alert 種別はアンエスケープされる', () => {
    expect(unescapeGfmAlerts('> \\[!NOTE]\n> body')).toBe('> [!NOTE]\n> body');
    expect(unescapeGfmAlerts('> \\[!TIP]')).toBe('> [!TIP]');
    expect(unescapeGfmAlerts('> \\[!IMPORTANT]')).toBe('> [!IMPORTANT]');
    expect(unescapeGfmAlerts('> \\[!WARNING]')).toBe('> [!WARNING]');
    expect(unescapeGfmAlerts('> \\[!CAUTION]')).toBe('> [!CAUTION]');
  });

  it('未知の種別には触らない（誤爆防止）', () => {
    expect(unescapeGfmAlerts('> \\[!HINT]')).toBe('> \\[!HINT]');
    expect(unescapeGfmAlerts('\\[!something]')).toBe('\\[!something]');
  });

  it('Alert 以外のエスケープは保持する', () => {
    expect(unescapeGfmAlerts('text \\[link]')).toBe('text \\[link]');
  });
});

describe('yamlString', () => {
  it('普通の文字列は二重引用符で囲むだけ', () => {
    expect(yamlString('hello')).toBe('"hello"');
  });

  it('ダブルクオートはエスケープされる', () => {
    expect(yamlString('say "hi"')).toBe('"say \\"hi\\""');
  });

  it('バックスラッシュはエスケープされる', () => {
    expect(yamlString('a\\b')).toBe('"a\\\\b"');
  });

  it('改行は空白に潰される（LF / CRLF 両対応）', () => {
    expect(yamlString('line1\nline2')).toBe('"line1 line2"');
    expect(yamlString('line1\r\nline2')).toBe('"line1 line2"');
  });

  it('改行 + ダブルクオート + バックスラッシュが混在しても安全', () => {
    expect(yamlString('a\n"b"\\c')).toBe('"a \\"b\\"\\\\c"');
  });
});
