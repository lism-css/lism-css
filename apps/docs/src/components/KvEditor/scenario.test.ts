import { describe, it, expect } from 'vitest';
import { INITIAL_HTML_BY_LANG, type DemoLang } from './initial-code';
import { SCENARIO_BY_LANG } from './scenario';

// scenario.ts は edits と初期コードの整合をモジュール初期化時に検証して throw する。
// ただしこの検証はクライアントバンドルでしか評価されず astro build をすり抜けるため、
// ここで import して全言語ぶんを導出し、不整合をテストで検出できるようにする。
describe('SCENARIO_BY_LANG', () => {
  const langs = Object.keys(SCENARIO_BY_LANG) as DemoLang[];

  it('全言語のシナリオが導出できる（edits と初期コードが整合している）', () => {
    expect(langs.length).toBeGreaterThan(0);
    for (const lang of langs) {
      expect(SCENARIO_BY_LANG[lang].length).toBeGreaterThan(0);
    }
  });

  it.each(langs)('[%s] 各ステップが直前のコードを実際に書き換える', (lang) => {
    let prev = INITIAL_HTML_BY_LANG[lang];
    for (const step of SCENARIO_BY_LANG[lang]) {
      expect(step.resultCode).not.toBe(prev);
      expect(step.userMessage).not.toBe('');
      expect(step.aiMessage).not.toBe('');
      prev = step.resultCode;
    }
  });
});
