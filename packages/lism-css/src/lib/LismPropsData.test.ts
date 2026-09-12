import { describe, test, expect } from 'vitest';
import { LismPropsData } from './getLismProps';

// LismPropsData は getLismProps の内部クラス。
// prop 解析の振る舞いテスト（hov / ブレイクポイント / trait / プリセット・カスタム値分岐 等）は
// 公開 API である getLismProps.test.ts 側に集約しているため、このファイルでは
// 「内部バケットの分離」「buildClassName の出力順」「attrs/styles の基本」の 3 観点のみを扱う。
describe('LismPropsData', () => {
  describe('基本動作', () => {
    test('空のpropsでインスタンスが作成される', () => {
      const instance = new LismPropsData({});
      expect(instance.className).toBe('');
      expect(instance.primitiveClass).toEqual([]);
      expect(instance.setClasses).toEqual([]);
      expect(instance.traitClasses).toEqual([]);
      expect(instance.uClasses).toEqual([]);
      expect(instance.propClasses).toEqual([]);
      expect(instance.styles).toEqual({});
      expect(instance.attrs).toEqual({});
    });
  });

  describe('バケット分離', () => {
    test('primitiveClass 入力はそのまま primitiveClass バケットに保持される', () => {
      const instance = new LismPropsData({ primitiveClass: ['a--divider', 'l--flex'] });
      expect(instance.primitiveClass).toEqual(['a--divider', 'l--flex']);
    });

    test('set は setClasses バケットに入る', () => {
      const instance = new LismPropsData({ set: 'hov' });
      expect(instance.setClasses).toContain('set--hov');
      expect(instance.propClasses).not.toContain('set--hov');
      expect(instance.uClasses).not.toContain('set--hov');
    });

    test('trait prop (isContainer) は traitClasses バケットに入る', () => {
      const instance = new LismPropsData({ isContainer: true });
      expect(instance.traitClasses).toContain('is--container');
      expect(instance.uClasses).not.toContain('is--container');
      expect(instance.propClasses).not.toContain('is--container');
    });

    test('util は uClasses バケットに入る', () => {
      const instance = new LismPropsData({ util: 'cbox' });
      expect(instance.uClasses).toContain('u--cbox');
      expect(instance.propClasses).not.toContain('u--cbox');
      expect(instance.setClasses).not.toContain('u--cbox');
    });

    test('Lism prop (p) は propClasses バケットに入る', () => {
      const instance = new LismPropsData({ p: '20' });
      expect(instance.propClasses).toContain('-p:20');
      expect(instance.uClasses).not.toContain('-p:20');
    });

    test('hov は propClasses バケットに入る', () => {
      const instance = new LismPropsData({ hov: true });
      expect(instance.propClasses).toContain('-hov');
    });

    test('css は styles に流れ、どのクラスバケットにも入らない', () => {
      const instance = new LismPropsData({
        css: { margin: '10px', padding: '20px' },
      });
      expect(instance.styles.margin).toBe('10px');
      expect(instance.styles.padding).toBe('20px');
      expect(instance.primitiveClass).toEqual([]);
      expect(instance.setClasses).toEqual([]);
      expect(instance.traitClasses).toEqual([]);
      expect(instance.uClasses).toEqual([]);
      expect(instance.propClasses).toEqual([]);
    });

    test('style は styles バケットに保持される', () => {
      const instance = new LismPropsData({
        style: { color: 'red', fontSize: '16px' },
      });
      expect(instance.styles).toEqual({ color: 'red', fontSize: '16px' });
    });

    test('Lism Props 以外の属性は attrs に保持される', () => {
      const onClick = () => {};
      const instance = new LismPropsData({
        id: 'test-id',
        'data-test': 'value',
        'aria-label': 'test',
        onClick,
      });
      expect(instance.attrs.id).toBe('test-id');
      expect(instance.attrs['data-test']).toBe('value');
      expect(instance.attrs['aria-label']).toBe('test');
      expect(instance.attrs.onClick).toBe(onClick);
    });

    test('forwardedRef は attrs.ref にマップされる', () => {
      const mockRef = { current: null };
      const instance = new LismPropsData({ forwardedRef: mockRef });
      expect(instance.attrs.ref).toBe(mockRef);
    });
  });

  describe('buildClassName - 出力順', () => {
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

    test('primitiveClass 空でも他のバケットは規定の順序を保つ', () => {
      const instance = new LismPropsData({
        set: 'bxsh',
        hasTransition: true,
        util: 'trim',
        fz: 'xl',
      });
      const cls = instance.className;
      expect(cls.indexOf('set--bxsh')).toBeLessThan(cls.indexOf('has--transition'));
      expect(cls.indexOf('has--transition')).toBeLessThan(cls.indexOf('u--trim'));
      expect(cls.indexOf('u--trim')).toBeLessThan(cls.indexOf('-fz:xl'));
    });
  });
});
