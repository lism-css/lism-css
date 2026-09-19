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
    expect(instance.className).toBe('c--box l--flex set--hov is--container u--cbox -p:20');
  });
});
