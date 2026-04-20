import { describe, test, expect } from 'vitest';
import { LismPropsData } from './getLismProps';

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

    test('classNameが設定される', () => {
      const instance = new LismPropsData({ className: 'test-class' });
      expect(instance.className).toContain('test-class');
    });

    test('Astroのclass属性が処理される', () => {
      const instance = new LismPropsData({ class: 'astro-class' });
      expect(instance.className).toContain('astro-class');
    });

    test('className と class が両方指定された場合、両方マージされ重複は除去される', () => {
      const instance = new LismPropsData({
        className: 'c--foo',
        class: 'user-class c--foo',
      });
      expect(instance.className).toContain('c--foo');
      expect(instance.className).toContain('user-class');
      // 重複除去されて c--foo は 1 回だけ
      expect(instance.className.match(/c--foo/g)?.length).toBe(1);
    });
  });

  describe('ref処理', () => {
    test('forwardedRefがattrsに設定される', () => {
      const mockRef = { current: null };
      const instance = new LismPropsData({ forwardedRef: mockRef });
      expect(instance.attrs.ref).toBe(mockRef);
    });
  });

  describe('style処理', () => {
    test('styleが正しく設定される', () => {
      const instance = new LismPropsData({
        style: { color: 'red', fontSize: '16px' },
      });
      expect(instance.styles).toEqual({ color: 'red', fontSize: '16px' });
    });

    test('空のstyleも保持される', () => {
      const instance = new LismPropsData({ style: {} });
      expect(instance.styles).toEqual({});
    });
  });

  describe('analyzeProps - Lism Props処理', () => {
    test('fz: トークン値が property class になる', () => {
      const instance = new LismPropsData({ fz: 'xl' });
      expect(instance.propClasses).toContain('-fz:xl');
    });

    test('fz: カスタム値は変数として出力される', () => {
      const instance = new LismPropsData({ fz: '18px' });
      expect(instance.propClasses).toContain('-fz');
      expect(instance.styles['--fz']).toBe('18px');
    });

    test('w: カスタム値は変数として出力される (bp:1)', () => {
      const instance = new LismPropsData({ w: '200px' });
      expect(instance.propClasses).toContain('-w');
      expect(instance.styles['--w']).toBe('200px');
    });

    test('c: プリセット値が property class になる', () => {
      const instance = new LismPropsData({ c: 'base' });
      expect(instance.propClasses).toContain('-c:base');
    });

    test('c: カスタム値は変数として出力される', () => {
      const instance = new LismPropsData({ c: 'blue' });
      expect(instance.styles['--c']).toBe('var(--blue)');
    });

    test('p: トークン値が property class になる', () => {
      const instance = new LismPropsData({ p: '20' });
      expect(instance.propClasses).toContain('-p:20');
    });

    test(': プレフィックス付きの値は property class になる', () => {
      const instance = new LismPropsData({ w: ':fit' });
      expect(instance.propClasses).toContain('-w:fit');
      expect(instance.styles.width).toBeUndefined();
    });

    test('true値は property class のみ出力', () => {
      const instance = new LismPropsData({ w: true });
      expect(instance.propClasses).toContain('-w');
      expect(instance.styles.width).toBeUndefined();
    });

    test('- 値は property class のみ出力', () => {
      const instance = new LismPropsData({ w: '-' });
      expect(instance.propClasses).toContain('-w');
    });
  });

  describe('analyzeProps - ブレイクポイント指定', () => {
    test('オブジェクト形式でブレイクポイント指定 (トークン値)', () => {
      const instance = new LismPropsData({
        fz: { base: 'xl', sm: 'l' },
      });
      expect(instance.propClasses).toContain('-fz:xl');
      expect(instance.propClasses).toContain('-fz_sm');
      expect(instance.styles['--fz_sm']).toBe('var(--fz--l)');
    });

    test('配列形式でブレイクポイント指定 (トークン値)', () => {
      const instance = new LismPropsData({
        fz: ['xl', 'l', 'm'],
      });
      expect(instance.propClasses).toContain('-fz:xl');
      expect(instance.propClasses).toContain('-fz_sm');
      expect(instance.propClasses).toContain('-fz_md');
      expect(instance.styles['--fz_sm']).toBe('var(--fz--l)');
      expect(instance.styles['--fz_md']).toBe('var(--fz--m)');
    });

    test('カスタム値のブレイクポイント指定', () => {
      const instance = new LismPropsData({
        fz: { base: '16px', sm: '18px' },
      });
      expect(instance.propClasses).toContain('-fz');
      expect(instance.propClasses).toContain('-fz_sm');
      expect(instance.styles['--fz']).toBe('16px');
      expect(instance.styles['--fz_sm']).toBe('18px');
    });
  });

  describe('analyzeTrait - Trait処理', () => {
    test('isContainer: true でトレイトクラスが追加される', () => {
      const instance = new LismPropsData({ isContainer: true });
      expect(instance.traitClasses).toContain('is--container');
    });

    test('isContainer: false では何も追加されない', () => {
      const instance = new LismPropsData({ isContainer: false });
      expect(instance.traitClasses).not.toContain('is--container');
    });

    test('isWrapper: true でトレイトクラスが追加される', () => {
      const instance = new LismPropsData({ isWrapper: true });
      expect(instance.traitClasses).toContain('is--wrapper');
    });

    test('isWrapper: プリセット値でトレイトとプリセットクラスが追加される', () => {
      const instance = new LismPropsData({ isWrapper: 's' });
      expect(instance.traitClasses).toContain('is--wrapper -contentSize:s');
    });

    test('isWrapper: カスタム値でトレイトクラスと変数が追加される', () => {
      const instance = new LismPropsData({ isWrapper: '800px' });
      expect(instance.traitClasses).toContain('is--wrapper');
      expect(instance.styles['--contentSize']).toBe('800px');
    });

    test('isLayer: true でトレイトクラスが追加される', () => {
      const instance = new LismPropsData({ isLayer: true });
      expect(instance.traitClasses).toContain('is--layer');
    });

    test('複数のstateが同時に機能する', () => {
      const instance = new LismPropsData({
        isContainer: true,
        isLayer: true,
      });
      expect(instance.traitClasses).toContain('is--container');
      expect(instance.traitClasses).toContain('is--layer');
    });
  });

  describe('setHovProps - hov処理', () => {
    test('hov: true で-hovクラスが追加される', () => {
      const instance = new LismPropsData({ hov: true });
      expect(instance.propClasses).toContain('-hov');
    });

    test('hov: - で-hovクラスが追加される', () => {
      const instance = new LismPropsData({ hov: '-' });
      expect(instance.propClasses).toContain('-hov');
    });

    test('hov: 文字列でhoverクラスが追加される', () => {
      const instance = new LismPropsData({ hov: 'fade' });
      expect(instance.propClasses).toContain('-hov:fade');
    });

    test('hov: カンマ区切りで複数のクラスが追加される', () => {
      const instance = new LismPropsData({ hov: 'fade,shadow' });
      expect(instance.propClasses).toContain('-hov:fade');
      expect(instance.propClasses).toContain('-hov:shadow');
    });

    test('hov: 文字列はそのまま -hov:{入力} として出力される（自動変換なし）', () => {
      const instance = new LismPropsData({ hov: 'o' });
      expect(instance.propClasses).toContain('-hov:o');
      expect(instance.propClasses).not.toContain('-hov:-o');
    });

    test('hov: "-" 付きで指定した場合は -hov:-{prop} として出力される', () => {
      const instance = new LismPropsData({ hov: '-o' });
      expect(instance.propClasses).toContain('-hov:-o');
    });

    test('hov: カンマ区切りでもそれぞれそのまま出力される', () => {
      const instance = new LismPropsData({ hov: '-c,-bxsh,neutral,in:zoom' });
      expect(instance.propClasses).toContain('-hov:-c');
      expect(instance.propClasses).toContain('-hov:-bxsh');
      expect(instance.propClasses).toContain('-hov:neutral');
      expect(instance.propClasses).toContain('-hov:in:zoom');
    });

    test('hov: オブジェクト形式で値を指定すると -hov:-{key} + --hov-{key} 変数が出力される', () => {
      const instance = new LismPropsData({
        hov: { c: 'red', bgc: 'blue' },
      });
      expect(instance.propClasses).toContain('-hov:-c');
      expect(instance.propClasses).toContain('-hov:-bgc');
      expect(instance.styles['--hov-c']).toBe('var(--red)');
      expect(instance.styles['--hov-bgc']).toBe('var(--blue)');
    });

    test('hov: オブジェクト形式で true の場合はクラスのみ（- は付かない）', () => {
      const instance = new LismPropsData({
        hov: { c: true, shadowUp: true },
      });
      expect(instance.propClasses).toContain('-hov:c');
      expect(instance.propClasses).toContain('-hov:shadowUp');
      expect(instance.propClasses).not.toContain('-hov:-c');
      expect(instance.styles['--hov-c']).toBeUndefined();
    });

    test('hov: オブジェクト形式で "-" は true と同じくクラスのみ出力', () => {
      const instance = new LismPropsData({
        hov: { c: '-' },
      });
      expect(instance.propClasses).toContain('-hov:c');
      expect(instance.propClasses).not.toContain('-hov:-c');
      expect(instance.styles['--hov-c']).toBeUndefined();
    });
  });

  describe('css prop処理', () => {
    test('cssプロパティがstyleに追加される', () => {
      const instance = new LismPropsData({
        css: { margin: '10px', padding: '20px' },
      });
      expect(instance.styles.margin).toBe('10px');
      expect(instance.styles.padding).toBe('20px');
    });
  });

  describe('_propConfig処理', () => {
    test('_propConfigで設定を上書きできる', () => {
      const instance = new LismPropsData({
        w: '200px',
        _propConfig: {
          w: { isVar: 1 },
        },
      });
      expect(instance.styles['--w']).toBe('200px');
    });
  });

  describe('その他のattributes', () => {
    test('Lism Props以外の属性がattrsに保持される', () => {
      const instance = new LismPropsData({
        id: 'test-id',
        'data-test': 'value',
        'aria-label': 'test',
      });
      expect(instance.attrs.id).toBe('test-id');
      expect(instance.attrs['data-test']).toBe('value');
      expect(instance.attrs['aria-label']).toBe('test');
    });

    test('onClick などのイベントハンドラーが保持される', () => {
      const onClick = () => {};
      const instance = new LismPropsData({ onClick });
      expect(instance.attrs.onClick).toBe(onClick);
    });
  });

  describe('addUtil', () => {
    test('ユーティリティクラスが追加される', () => {
      const instance = new LismPropsData({});
      instance.addUtil('-test:class');
      expect(instance.uClasses).toContain('-test:class');
    });
  });

  describe('addUtils', () => {
    test('複数のユーティリティクラスが追加される', () => {
      const instance = new LismPropsData({});
      instance.addUtils(['-test:class1', '-test:class2']);
      expect(instance.uClasses).toContain('-test:class1');
      expect(instance.uClasses).toContain('-test:class2');
    });
  });

  describe('addStyle', () => {
    test('スタイルが追加される', () => {
      const instance = new LismPropsData({});
      instance.addStyle('--custom', 'value');
      expect(instance.styles['--custom']).toBe('value');
    });
  });

  describe('addStyles', () => {
    test('複数のスタイルが追加される', () => {
      const instance = new LismPropsData({});
      instance.addStyles({ color: 'red', fontSize: '16px' });
      expect(instance.styles.color).toBe('red');
      expect(instance.styles.fontSize).toBe('16px');
    });

    test('既存のスタイルとマージされる', () => {
      const instance = new LismPropsData({ style: { margin: '10px' } });
      instance.addStyles({ padding: '20px' });
      expect(instance.styles.margin).toBe('10px');
      expect(instance.styles.padding).toBe('20px');
    });
  });

  describe('extractProp', () => {
    test('プロパティを取得して削除する', () => {
      const instance = new LismPropsData({ 'data-custom': 'value' });
      instance.attrs['data-custom'] = 'value';
      const value = instance.extractProp('data-custom');
      expect(value).toBe('value');
      expect(instance.attrs['data-custom']).toBeUndefined();
    });

    test('存在しないプロパティはnullを返す', () => {
      const instance = new LismPropsData({});
      const value = instance.extractProp('nonexistent');
      expect(value).toBeNull();
    });
  });

  describe('extractProps', () => {
    test('複数のプロパティを取得して削除する', () => {
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

  describe('複雑な組み合わせ', () => {
    test('複数のプロパティが同時に機能する', () => {
      const instance = new LismPropsData({
        className: 'custom c--box',
        fz: 'xl',
        c: 'base',
        p: '20',
        isContainer: true,
        style: { margin: '10px' },
      });

      expect(instance.className).toContain('custom');
      expect(instance.className).toContain('c--box');
      expect(instance.className).toContain('is--container');
      expect(instance.traitClasses).toContain('is--container');
      expect(instance.propClasses).toContain('-fz:xl');
      expect(instance.propClasses).toContain('-c:base');
      expect(instance.propClasses).toContain('-p:20');
      expect(instance.styles.margin).toBe('10px');
    });

    test('null/undefined/空文字/falseの値は無視される', () => {
      const instance = new LismPropsData({
        fz: '',
        c: null,
        w: undefined,
        h: false,
        p: '20',
      });
      expect(instance.propClasses).not.toContain('-fz');
      expect(instance.propClasses).not.toContain('-c');
      expect(instance.propClasses).not.toContain('-w');
      expect(instance.propClasses).not.toContain('-h');
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
        set: 'var:sh',
        hasTransition: true,
        util: 'trim',
        fz: 'xl',
      });
      const cls = instance.className;
      expect(cls.indexOf('set--var:sh')).toBeLessThan(cls.indexOf('has--transition'));
      expect(cls.indexOf('has--transition')).toBeLessThan(cls.indexOf('u--trim'));
      expect(cls.indexOf('u--trim')).toBeLessThan(cls.indexOf('-fz:xl'));
    });
  });
});
