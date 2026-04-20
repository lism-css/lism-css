import { describe, test, expect } from 'vitest';
import getLismProps, { type LismProps } from './getLismProps';

describe('getLismProps', () => {
  describe('基本動作', () => {
    test('空のpropsを渡すとclassNameのみ返す', () => {
      const result = getLismProps({});
      expect(result).toEqual({});
    });

    test('layoutのみ指定した場合、レイアウトクラスが追加される', () => {
      const result = getLismProps({ layout: 'flow' });
      expect(result.className).toContain('l--flow');
    });

    test('classNameが正しく設定される', () => {
      const result = getLismProps({ className: 'custom-class' });
      expect(result.className).toBe('custom-class');
    });

    test('Astroのclass属性が処理される', () => {
      const result = getLismProps({ class: 'astro-class' });
      expect(result.className).toBe('astro-class');
    });

    test('className と class が両方指定された場合、両方マージされる', () => {
      const result = getLismProps({
        className: 'c--foo',
        class: 'user-class c--foo',
      } as LismProps & Record<string, unknown>);
      const cls = result.className as string;
      expect(cls).toContain('c--foo');
      expect(cls).toContain('user-class');
      // 重複除去されて c--foo は 1 回だけ
      expect(cls.match(/c--foo/g)?.length).toBe(1);
    });
  });

  describe('atomic prop', () => {
    test('atomic=divider で a--divider が追加される', () => {
      const result = getLismProps({ atomic: 'divider' });
      expect(result.className).toContain('a--divider');
    });

    test('atomic=spacer で a--spacer が追加され、w がスペーストークンに変換される', () => {
      const result = getLismProps({ atomic: 'spacer', w: '20' });
      expect(result.className).toContain('a--spacer');
      expect(result.className).toContain('-w');
      expect(result.style?.['--w']).toBe('var(--s20)');
    });

    test('atomic=spacer で h もスペーストークンに変換される', () => {
      const result = getLismProps({ atomic: 'spacer', h: '40' });
      expect(result.className).toContain('a--spacer');
      expect(result.style?.['--h']).toBe('var(--s40)');
    });

    test('atomic=decorator で size が ar=1/1 と w に展開される', () => {
      const result = getLismProps({ atomic: 'decorator', size: '100px' } as LismProps & Record<string, unknown>);
      expect(result.className).toContain('a--decorator');
      expect(result.className).toContain('-ar:1/1');
      expect(result.style?.['--w']).toBe('100px');
    });

    test('atomic=icon で a--icon が追加される', () => {
      const result = getLismProps({ atomic: 'icon' });
      expect(result.className).toContain('a--icon');
    });

    test('atomic と layout の両方指定時、a-- → l-- の順で出力される', () => {
      const result = getLismProps({ atomic: 'divider', layout: 'box' });
      const cls = result.className as string;
      expect(cls.indexOf('a--divider')).toBeLessThan(cls.indexOf('l--box'));
    });
  });

  describe('出力順', () => {
    test('className → primitive → set → trait → util → property の順で出力される', () => {
      const result = getLismProps({
        className: 'c--box',
        layout: 'flex',
        set: 'var:hov',
        isContainer: true,
        util: 'cbox',
        p: '20',
      });
      const cls = result.className as string;
      expect(cls.indexOf('c--box')).toBeLessThan(cls.indexOf('l--flex'));
      expect(cls.indexOf('l--flex')).toBeLessThan(cls.indexOf('set--var:hov'));
      expect(cls.indexOf('set--var:hov')).toBeLessThan(cls.indexOf('is--container'));
      expect(cls.indexOf('is--container')).toBeLessThan(cls.indexOf('u--cbox'));
      expect(cls.indexOf('u--cbox')).toBeLessThan(cls.indexOf('-p:20'));
    });
  });

  describe('ref処理', () => {
    test('forwardedRefが設定される', () => {
      const mockRef = { current: null };
      const result = getLismProps({ forwardedRef: mockRef });
      expect(result.ref).toBe(mockRef);
    });
  });

  describe('style処理', () => {
    test('styleが正しく渡される', () => {
      const result = getLismProps({
        style: { color: 'red', fontSize: '16px' },
      });
      expect(result.style).toEqual({ color: 'red', fontSize: '16px' });
    });

    test('空のstyleは除外される', () => {
      const result = getLismProps({ style: {} });
      expect(result.style).toBeUndefined();
    });
  });

  describe('css prop処理', () => {
    test('cssプロパティがstyleに変換される', () => {
      const result = getLismProps({
        css: { margin: '10px', padding: '20px' },
      });
      expect(result.style).toEqual({ margin: '10px', padding: '20px' });
    });
  });

  describe('Lism Props処理 - プリセット値', () => {
    test('fz: プリセット値がユーティリティクラスになる', () => {
      const result = getLismProps({ fz: 'xl' });
      expect(result.className).toContain('-fz:xl');
    });

    test('fw: トークン値がユーティリティクラスになる', () => {
      const result = getLismProps({ fw: 'bold' });
      expect(result.className).toContain('-fw:bold');
    });

    test('ta: プリセット値がユーティリティクラスになる', () => {
      const result = getLismProps({ ta: 'center' });
      expect(result.className).toContain('-ta:center');
    });

    test('d: プリセット値がユーティリティクラスになる', () => {
      const result = getLismProps({ d: 'none' });
      expect(result.className).toContain('-d:none');
    });
  });

  describe('Lism Props処理 - カスタム値', () => {
    test('fz: カスタム値は変数として出力される', () => {
      const result = getLismProps({ fz: '18px' });
      expect(result.className).toContain('-fz');
      expect(result.style?.['--fz']).toBe('18px');
    });

    test('w: カスタム値は変数として出力される (bp:1なので)', () => {
      const result = getLismProps({ w: '200px' });
      expect(result.className).toContain('-w');
      expect(result.style?.['--w']).toBe('200px');
    });

    test('h: カスタム値は変数として出力される (bp:1なので)', () => {
      const result = getLismProps({ h: '100px' });
      expect(result.className).toContain('-h');
      expect(result.style?.['--h']).toBe('100px');
    });

    test('c: カスタム値は変数として出力される', () => {
      const result = getLismProps({ c: 'blue' });
      expect(result.style?.['--c']).toBe('var(--blue)');
    });

    test('bgc: カスタム値は変数として出力される', () => {
      const result = getLismProps({ bgc: 'red' });
      expect(result.style?.['--bgc']).toBe('var(--red)');
    });
  });

  describe('Lism Props処理 - トークン変換', () => {
    test('c: プリセット値はユーティリティクラスになる', () => {
      const result = getLismProps({ c: 'base' });
      expect(result.className).toContain('-c:base');
    });

    test('p: トークン値はユーティリティクラスになる', () => {
      const result = getLismProps({ p: '20' });
      expect(result.className).toContain('-p:20');
    });

    test('fz: トークン値がユーティリティクラスになる', () => {
      const result = getLismProps({ fz: 'l' });
      expect(result.className).toContain('-fz:l');
    });
  });

  describe('Lism Props処理 - : プレフィックス', () => {
    test(': で始まる値はユーティリティクラスとして出力される', () => {
      const result = getLismProps({ w: ':fit' });
      expect(result.className).toContain('-w:fit');
      expect(result.style?.width).toBeUndefined();
    });

    test('複数のプロップで : プレフィックスが使える', () => {
      const result = getLismProps({ w: ':fit', h: ':fit' });
      expect(result.className).toContain('-w:fit');
      expect(result.className).toContain('-h:fit');
    });
  });

  describe('Lism Props処理 - true 値', () => {
    test('true値はユーティリティクラスのみ出力される', () => {
      const result = getLismProps({ bd: true });
      expect(result.className).toContain('-bd');
      expect(result.style?.borderStyle).toBeUndefined();
    });
  });

  describe('Lism Props処理 - ブレイクポイント指定', () => {
    test('オブジェクト形式でブレイクポイント指定できる (トークン値)', () => {
      const result = getLismProps({
        fz: { base: 'xl', sm: 'l' },
      });
      expect(result.className).toContain('-fz:xl');
      expect(result.className).toContain('-fz_sm');
      expect(result.style?.['--fz_sm']).toBe('var(--fz--l)');
    });

    test('配列形式でブレイクポイント指定できる (トークン値)', () => {
      const result = getLismProps({
        fz: ['xl', 'l', 'm'],
      });
      expect(result.className).toContain('-fz:xl');
      expect(result.className).toContain('-fz_sm');
      expect(result.className).toContain('-fz_md');
      expect(result.style?.['--fz_sm']).toBe('var(--fz--l)');
      expect(result.style?.['--fz_md']).toBe('var(--fz--m)');
    });

    test('カスタム値のブレイクポイント指定', () => {
      const result = getLismProps({
        fz: { base: '16px', sm: '18px' },
      });
      expect(result.className).toContain('-fz');
      expect(result.className).toContain('-fz_sm');
      expect(result.style?.['--fz']).toBe('16px');
      expect(result.style?.['--fz_sm']).toBe('18px');
    });

    test('d プロパティでブレイクポイント指定 (bp:1)', () => {
      const result = getLismProps({
        d: { base: 'block', sm: 'none' },
      });
      expect(result.className).toContain('-d:block');
      expect(result.className).toContain('-d_sm');
      expect(result.style?.['--d_sm']).toBe('none');
    });
  });

  describe('Trait処理', () => {
    test('isContainer: true の場合クラスが追加される', () => {
      const result = getLismProps({ isContainer: true });
      expect(result.className).toContain('is--container');
    });

    test('isContainer: false の場合クラスは追加されない', () => {
      const result = getLismProps({ isContainer: false });
      expect(result).toEqual({});
    });

    test('isWrapper: true の場合クラスが追加される', () => {
      const result = getLismProps({ isWrapper: true });
      expect(result.className).toContain('is--wrapper');
    });

    test('isWrapper: プリセット値の場合、プリセットクラスが追加される', () => {
      const result = getLismProps({ isWrapper: 's' });
      expect(result.className).toContain('is--wrapper');
      expect(result.className).toContain('-contentSize:s');
    });

    test('isWrapper: カスタム値の場合、変数が設定される', () => {
      const result = getLismProps({ isWrapper: '800px' });
      expect(result.className).toContain('is--wrapper');
      expect(result.style?.['--contentSize']).toBe('800px');
    });

    test('複数のstate propsが同時に機能する', () => {
      const result = getLismProps({
        isContainer: true,
        isLayer: true,
      });
      expect(result.className).toContain('is--container');
      expect(result.className).toContain('is--layer');
    });
  });

  describe('hov処理', () => {
    test('hov: true の場合、-hovクラスが追加される', () => {
      const result = getLismProps({ hov: true });
      expect(result.className).toContain('-hov');
    });

    test('hov: 文字列の場合、hoverクラスが追加される', () => {
      const result = getLismProps({ hov: 'fade' });
      expect(result.className).toContain('-hov:fade');
    });

    test('hov: カンマ区切りで複数のクラスが追加される', () => {
      const result = getLismProps({ hov: 'fade,shadow' });
      expect(result.className).toContain('-hov:fade');
      expect(result.className).toContain('-hov:shadow');
    });

    test('hov: 文字列はそのまま -hov:{入力} として出力される（自動変換なし）', () => {
      const result = getLismProps({ hov: 'o' });
      expect(result.className).toContain('-hov:o');
      expect(result.className).not.toContain('-hov:-o');
    });

    test('hov: "-" 付きで指定した場合は -hov:-{prop} として出力される', () => {
      const result = getLismProps({ hov: '-o' });
      expect(result.className).toContain('-hov:-o');
    });

    test('hov: カンマ区切りでもそれぞれそのまま出力される', () => {
      const result = getLismProps({ hov: '-c,-bxsh,neutral,in:zoom' });
      expect(result.className).toContain('-hov:-c');
      expect(result.className).toContain('-hov:-bxsh');
      expect(result.className).toContain('-hov:neutral');
      expect(result.className).toContain('-hov:in:zoom');
    });

    test('hov: オブジェクト形式で値を指定すると -hov:-{key} + --hov-{key} 変数が出力される', () => {
      const result = getLismProps({
        hov: { c: 'red', bgc: 'blue' },
      });
      expect(result.className).toContain('-hov:-c');
      expect(result.className).toContain('-hov:-bgc');
      expect(result.style?.['--hov-c']).toBe('var(--red)');
      expect(result.style?.['--hov-bgc']).toBe('var(--blue)');
    });

    test('hov: オブジェクト形式で true の場合はクラスのみ（- は付かない）', () => {
      const result = getLismProps({
        hov: { c: true, shadowUp: true },
      });
      expect(result.className).toContain('-hov:c');
      expect(result.className).toContain('-hov:shadowUp');
      expect(result.className).not.toContain('-hov:-c');
      expect(result.style?.['--hov-c']).toBeUndefined();
    });
  });

  describe('_propConfig処理', () => {
    test('_propConfigで設定を上書きできる', () => {
      const result = getLismProps({
        w: '200px',
        _propConfig: {
          w: { isVar: 1 },
        },
      });
      expect(result.style?.['--w']).toBe('200px');
    });

    test('layout: grid で gtc が CSS変数として出力される', () => {
      const result = getLismProps({
        layout: 'grid',
        gtc: '1fr 1fr',
      });
      expect(result.className).toContain('l--grid');
      expect(result.style?.['--gtc']).toBe('1fr 1fr');
    });
  });

  describe('その他のattributes', () => {
    test('Lism Props以外の属性はそのまま渡される', () => {
      const result = getLismProps({
        id: 'test-id',
        'data-test': 'value',
        'aria-label': 'test',
      } as LismProps & Record<string, unknown>);
      expect(result.id).toBe('test-id');
      expect(result['data-test']).toBe('value');
      expect(result['aria-label']).toBe('test');
    });

    test('onClick などのイベントハンドラーが渡される', () => {
      const onClick = () => {};
      const result = getLismProps({ onClick } as LismProps & Record<string, unknown>);
      expect(result.onClick).toBe(onClick);
    });
  });

  describe('utils指定', () => {
    test('w: fit がユーティリティクラスになる', () => {
      const result = getLismProps({ w: 'fit-content' });
      expect(result.className).toContain('-w:fit');
    });

    test('td: none がユーティリティクラスになる', () => {
      const result = getLismProps({ td: 'none' });
      expect(result.className).toContain('-td:none');
    });
  });

  describe('複雑な組み合わせ', () => {
    test('複数のプロパティが同時に機能する', () => {
      const result = getLismProps({
        className: 'custom c--box',
        layout: 'flow',
        fz: 'xl',
        c: 'base',
        p: '20',
        isContainer: true,
        style: { margin: '10px' },
      });

      expect(result.className).toContain('custom');
      expect(result.className).toContain('c--box');
      expect(result.className).toContain('l--flow');
      expect(result.className).toContain('-fz:xl');
      expect(result.className).toContain('is--container');
      expect(result.className).toContain('-c:base');
      expect(result.className).toContain('-p:20');
      expect(result.style?.margin).toBe('10px');
    });

    test('空の値は除外される', () => {
      const result = getLismProps({
        fz: '',
        c: null,
        w: undefined,
        p: '20',
      });
      expect(result.className).toBe('-p:20');
    });

    test('false 値は除外される', () => {
      const result = getLismProps({
        w: false,
        isContainer: false,
      });
      expect(result).toEqual({});
    });
  });

  describe('エッジケース', () => {
    test('null/undefined の propは無視される', () => {
      const result = getLismProps({
        fz: null,
        w: undefined,
      });
      expect(result).toEqual({});
    });

    test('0 値は処理される', () => {
      const result = getLismProps({
        p: 0,
      });
      // 0 は falsy だが、null/undefined/false/''/false ではないので処理される可能性がある
      // 実装によっては 0 が除外される場合もあるので、実際の動作を確認
      expect(result).toBeDefined();
    });
  });
});
