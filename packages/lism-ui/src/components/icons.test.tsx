import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Alert } from './Alert/react/Alert';
import { Callout } from './Callout/react/Callout';
import CloseBtn from './Modal/react/CloseBtn';
import Close from './Popover/react/Close';

const customIcon = '<svg viewBox="0 0 24 24"><path data-custom="true" d="M1 2L3 4" /></svg>';

describe('UIの既定アイコン', () => {
  it('AlertとCalloutの各種別が、コアの名前指定に依存せずSVGを描画する', () => {
    for (const Component of [Alert, Callout]) {
      for (const type of ['alert', 'point', 'tip', 'warning', 'check', 'help', 'info', 'note', 'unknown']) {
        const html = renderToStaticMarkup(
          <Component type={type} title="Title">
            Body
          </Component>
        );
        expect(html).toMatch(/<svg\b[^>]*aria-hidden="true"/);
        expect(html).toMatch(/<(?:path|circle|line|polyline|polygon|rect)\b/);
        expect(html).toContain('stroke="currentColor"');
        expect(html).toContain('viewBox="0 0 24 24"');
      }
    }
  });

  it('閉じるボタンがSVGと読み上げ用ラベルを描画する', () => {
    for (const Component of [CloseBtn, Close]) {
      const html = renderToStaticMarkup(<Component srText="閉じる" />);
      expect(html).toMatch(/<svg\b[^>]*aria-hidden="true"/);
      expect(html).toMatch(/<(?:path|line)\b/);
      expect(html).toContain('閉じる');
    }
  });

  it('既定アイコンを呼び出し側のSVGで置き換えられる', () => {
    for (const Component of [Alert, Callout, CloseBtn, Close]) {
      const html = renderToStaticMarkup(<Component icon={customIcon} title="Title" />);
      expect(html.match(/<svg\b/g)).toHaveLength(1);
      expect(html).toContain('data-custom="true"');
    }
  });
});
