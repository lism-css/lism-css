import { describe, test, expect } from 'vitest';
import { LismPropsData } from './getLismProps';

// prop解析の振る舞いは公開APIのgetLismProps.test.tsで検証する。
// ここではexportされたclassを直接使った場合の最終class順だけを確認する。
describe('LismPropsData', () => {
  test('className → primitiveClass → setClasses → traitClasses → uClasses → propClasses の順で結合される', () => {
    const instance = new LismPropsData({
      className: 'c--box',
      primitiveClass: ['l--flex'],
      set: 'hov',
      isContainer: true,
      util: 'cbox',
      p: '20',
    });
    const cls = instance.className;
    expect(cls.indexOf('c--box')).toBeLessThan(cls.indexOf('l--flex'));
    expect(cls.indexOf('l--flex')).toBeLessThan(cls.indexOf('set--hov'));
    expect(cls.indexOf('set--hov')).toBeLessThan(cls.indexOf('is--container'));
    expect(cls.indexOf('is--container')).toBeLessThan(cls.indexOf('u--cbox'));
    expect(cls.indexOf('u--cbox')).toBeLessThan(cls.indexOf('-p:20'));
  });
});
