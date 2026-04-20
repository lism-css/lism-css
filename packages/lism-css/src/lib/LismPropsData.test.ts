import { describe, test, expect } from 'vitest';
import { LismPropsData } from './getLismProps';

// LismPropsData は getLismProps の内部クラス。
// prop 解析の振る舞いテスト（hov / ブレイクポイント / trait / プリセット・カスタム値分岐 等）は
// 公開 API である getLismProps.test.ts 側に集約しているため、このファイルでは
// 「内部バケットの分離」「buildClassName の出力順」「メソッド単位の動作」「attrs/styles の基本」
// の 4 観点のみを扱う。
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

    test('className と class が両方指定された場合、両方マージされ重複は除去される', () => {
      const instance = new LismPropsData({
        className: 'c--foo',
        class: 'user-class c--foo',
      });
      expect(instance.className).toContain('c--foo');
      expect(instance.className).toContain('user-class');
      expect(instance.className.match(/c--foo/g)?.length).toBe(1);
    });
  });

  describe('バケット分離', () => {
    test('primitiveClass 入力はそのまま primitiveClass バケットに保持される', () => {
      const instance = new LismPropsData({ primitiveClass: ['a--divider', 'l--flex'] });
      expect(instance.primitiveClass).toEqual(['a--divider', 'l--flex']);
    });

    test('set は setClasses バケットに入る', () => {
      const instance = new LismPropsData({ set: 'var:hov' });
      expect(instance.setClasses).toContain('set--var:hov');
      expect(instance.propClasses).not.toContain('set--var:hov');
      expect(instance.uClasses).not.toContain('set--var:hov');
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

    test('全バケットに要素が同時に投入されても、それぞれが正しいバケットに振り分けられる', () => {
      const instance = new LismPropsData({
        primitiveClass: ['l--flex'],
        set: 'var:bxsh',
        isContainer: true,
        util: 'cbox',
        p: '20',
      });
      expect(instance.primitiveClass).toEqual(['l--flex']);
      expect(instance.setClasses).toContain('set--var:bxsh');
      expect(instance.traitClasses).toContain('is--container');
      expect(instance.uClasses).toContain('u--cbox');
      expect(instance.propClasses).toContain('-p:20');
    });
  });

  describe('buildClassName - 出力順', () => {
    test('className → primitiveClass → setClasses → traitClasses → uClasses → propClasses の順で結合される', () => {
      const instance = new LismPropsData({
        className: 'c--box',
        primitiveClass: ['l--flex'],
        set: 'var:hov',
        isContainer: true,
        util: 'cbox',
        p: '20',
      });
      const cls = instance.className;
      expect(cls.indexOf('c--box')).toBeLessThan(cls.indexOf('l--flex'));
      expect(cls.indexOf('l--flex')).toBeLessThan(cls.indexOf('set--var:hov'));
      expect(cls.indexOf('set--var:hov')).toBeLessThan(cls.indexOf('is--container'));
      expect(cls.indexOf('is--container')).toBeLessThan(cls.indexOf('u--cbox'));
      expect(cls.indexOf('u--cbox')).toBeLessThan(cls.indexOf('-p:20'));
    });

    test('primitiveClass 空でも他のバケットは規定の順序を保つ', () => {
      const instance = new LismPropsData({
        set: 'var:bxsh',
        hasTransition: true,
        util: 'trim',
        fz: 'xl',
      });
      const cls = instance.className;
      expect(cls.indexOf('set--var:bxsh')).toBeLessThan(cls.indexOf('has--transition'));
      expect(cls.indexOf('has--transition')).toBeLessThan(cls.indexOf('u--trim'));
      expect(cls.indexOf('u--trim')).toBeLessThan(cls.indexOf('-fz:xl'));
    });
  });

  describe('メソッド', () => {
    describe('addUtil', () => {
      test('uClasses にユーティリティクラスが追加される', () => {
        const instance = new LismPropsData({});
        instance.addUtil('-test:class');
        expect(instance.uClasses).toContain('-test:class');
      });
    });

    describe('addUtils', () => {
      test('uClasses に複数のユーティリティクラスが追加される', () => {
        const instance = new LismPropsData({});
        instance.addUtils(['-a:1', '-b:2']);
        expect(instance.uClasses).toContain('-a:1');
        expect(instance.uClasses).toContain('-b:2');
      });
    });

    describe('addStyle', () => {
      test('styles にスタイルが追加される', () => {
        const instance = new LismPropsData({});
        instance.addStyle('--custom', 'value');
        expect(instance.styles['--custom']).toBe('value');
      });
    });

    describe('addStyles', () => {
      test('styles に複数のスタイルが追加される', () => {
        const instance = new LismPropsData({});
        instance.addStyles({ color: 'red', fontSize: '16px' });
        expect(instance.styles.color).toBe('red');
        expect(instance.styles.fontSize).toBe('16px');
      });

      test('既存の styles とマージされる', () => {
        const instance = new LismPropsData({ style: { margin: '10px' } });
        instance.addStyles({ padding: '20px' });
        expect(instance.styles.margin).toBe('10px');
        expect(instance.styles.padding).toBe('20px');
      });
    });

    describe('extractProp', () => {
      test('attrs からプロパティを取得して削除する', () => {
        const instance = new LismPropsData({});
        instance.attrs['data-custom'] = 'value';
        const value = instance.extractProp('data-custom');
        expect(value).toBe('value');
        expect(instance.attrs['data-custom']).toBeUndefined();
      });

      test('存在しないプロパティは null を返す', () => {
        const instance = new LismPropsData({});
        expect(instance.extractProp('nonexistent')).toBeNull();
      });
    });

    describe('extractProps', () => {
      test('複数のプロパティを一括で取得して削除する', () => {
        const instance = new LismPropsData({});
        instance.attrs = {
          prop1: 'value1',
          prop2: 'value2',
          prop3: 'value3',
        };
        const extracted = instance.extractProps(['prop1', 'prop2']);
        expect(extracted).toEqual({ prop1: 'value1', prop2: 'value2' });
        expect(instance.attrs.prop1).toBeUndefined();
        expect(instance.attrs.prop2).toBeUndefined();
        expect(instance.attrs.prop3).toBe('value3');
      });
    });
  });
});
