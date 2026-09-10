import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { icons } from './config.mjs';
import { normalizeSvg } from './normalize-svg.mjs';

const wrap = (body, attributes = '') => `<svg viewBox="0 0 24 24" ${attributes}>${body}</svg>`;
const stroke = 'fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
const line = `<path d="M1 2L3 4" ${stroke}/>`;

test('全47アイコンを正規化でき、再実行しても変わらない', () => {
  assert.equal(icons.length, 47);
  for (const icon of icons) {
    const source = readFileSync(new URL(`../src/svg/${icon.id}.svg`, import.meta.url), 'utf8');
    const result = normalizeSvg(source, icon);
    assert.deepEqual(normalizeSvg(result.svg, icon), result, icon.id);
    assert.doesNotMatch(result.body, /<g\b|\bid=|data-name=|stroke-width=/);
    assert.equal(result.attributes['stroke-width'], icon.fill ? undefined : '1.5');
  }
});

test('線幅をルートに寄せ、円の種類と座標を保持する', () => {
  const result = normalizeSvg(wrap(`<circle cx="12" cy="9" r=".375" ${stroke}/>`));
  assert.equal(result.body, '<circle cx="12" cy="9" r=".375"/>');
  assert.equal(result.attributes['stroke-width'], '1.5');
});

test('混合アイコンの塗りと描画順を保持する', () => {
  const result = normalizeSvg(wrap(`<path d="M0 0L2 2Z"/>${line}`), { mixed: true });
  assert.equal(result.body, '<path d="M0 0L2 2Z" fill="currentColor" stroke="none"/><path d="M1 2L3 4"/>');
});

test('グループの継承属性とmiter例外を要素へ引き継ぐ', () => {
  const result = normalizeSvg(
    wrap(`<g ${stroke} stroke-miterlimit="10"><g stroke-linejoin="miter"><path d="M1 2L3 4"/></g><circle cx="1" cy="2" r="3"/></g>`)
  );
  assert.equal(
    result.body,
    '<path d="M1 2L3 4" stroke-linejoin="miter" stroke-miterlimit="10"/><circle cx="1" cy="2" r="3" stroke-miterlimit="10"/>'
  );
});

test('背景だけを除去し、可視の全体rectは保持する', () => {
  const result = normalizeSvg(wrap(`<rect width="24" height="24" fill="none"/><rect width="24" height="24" ${stroke}/>`));
  assert.equal(result.body, '<rect width="24" height="24"/>');
});

test('暗黙のSVG線端・線結合を変更しない', () => {
  const result = normalizeSvg(wrap('<path d="M1 2L3 4" fill="none" stroke="black" stroke-width="1.5"/>'));
  assert.match(result.body, /stroke-linecap="butt" stroke-linejoin="miter"/);
});

test('純塗りの分類と塗り規則を保持する', () => {
  const result = normalizeSvg(wrap('<g fill-rule="evenodd"><path d="M0 0L2 2Z"/></g>'), { fill: true });
  assert.deepEqual(result.attributes, { fill: 'currentColor', stroke: 'none' });
  assert.match(result.body, /fill-rule="evenodd"/);
});

test('分類の不一致を拒否する', () => {
  assert.throws(() => normalizeSvg(wrap(line), { fill: true }), /分類/);
  assert.throws(() => normalizeSvg(wrap(line), { mixed: true }), /分類/);
  assert.throws(() => normalizeSvg(wrap('<path d="M0 0L2 2Z"/>')), /分類/);
});

test('別サイズ・未知のSVG機能・別線幅を黙って削除しない', () => {
  const unsupported = [
    wrap(line).replace('0 0 24 24', '0 0 256 256'),
    wrap(`<g transform="translate(1 2)">${line}</g>`),
    wrap(line, 'style="opacity:.5"'),
    wrap('<use href="#a"/>'),
    wrap(line.replace('stroke="#000"', 'stroke="url(#a)"')),
    wrap(line.replace('1.5', '2')),
    wrap(`${line}<script>alert(1)</script>`),
    `<!DOCTYPE svg>${wrap(line)}`,
  ];
  for (const source of unsupported) assert.throws(() => normalizeSvg(source));
});
