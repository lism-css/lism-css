import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';
import { describe, expect, test } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const silentLogger = { warn: () => {}, debug: () => {} };

function compileString(source: string): string {
  return sass.compileString(source, {
    url: pathToFileURL(resolve(currentDir, '__layer_mode_test.scss')),
    logger: silentLogger,
  }).css;
}

function compileEntry(entry: string): string {
  return sass.compile(resolve(currentDir, entry), { logger: silentLogger }).css;
}

const testProp = `
  $props: (
    'zztest': (
      prop: 'padding',
      utilities: (
        '10': '10px',
      ),
    ),
  )
`;

describe('mixin: maybe_double / maybe_where / in_base_layer', () => {
  const body = `
#{mixin.maybe_double('.u--a', '[data-x]')} { color: red; }
#{mixin.maybe_double('.u--b')} > * { color: red; }
#{mixin.maybe_where('.-bd, [data-bd]')} { color: red; }
@include mixin.in_base_layer { .zz { color: red; } }
`;

  test('$layer_mode: 1 はセレクタをそのまま出力し、@layer lism-base に包む', () => {
    const css = compileString(`@use './mixin' as mixin;\n${body}`);

    expect(css).toContain('.u--a, [data-x] {');
    expect(css).toContain('.u--b > * {');
    expect(css).toContain('.-bd, [data-bd] {');
    expect(css).toContain('@layer lism-base {');
  });

  test('$layer_mode: 0 はセレクタを二重化し、:where() で包み、@layer を出力しない', () => {
    const css = compileString(`@use './mixin' with ($layer_mode: 0);\n${body}`);

    expect(css).toContain('.u--a.u--a, [data-x][data-x] {');
    expect(css).toContain('.u--b.u--b > * {');
    expect(css).toContain(':where(.-bd, [data-bd]) {');
    expect(css).not.toContain('@layer');
  });
});

describe('$default_important の解決', () => {
  const autoOutput = (settingWith: string, mixinWith: string) =>
    compileString(`
@use './setting' with (${settingWith});
@use './mixin' with (${mixinWith});
@use './auto_output';
`);

  test('$layer_mode: 1 は setting.$default_important に従う', () => {
    expect(autoOutput(`${testProp}, $default_important: 0`, '$layer_mode: 1')).toMatch(/padding: 10px;/);
    expect(autoOutput(`${testProp}, $default_important: 1`, '$layer_mode: 1')).toMatch(/padding: 10px\s+!important;/);
  });

  test('$layer_mode: 0 は setting.$default_important が 0 でも !important を付ける', () => {
    expect(autoOutput(`${testProp}, $default_important: 0`, '$layer_mode: 0')).toMatch(/padding: 10px\s+!important;/);
  });

  test('$layer_mode: 0 でも mixin.$default_important: 0 を明示すれば外せる', () => {
    expect(autoOutput(`${testProp}, $default_important: 0`, '$layer_mode: 0, $default_important: 0')).toMatch(/padding: 10px;/);
  });
});

describe('no_layer エントリ', () => {
  test('main_no_layer は Property Class に !important を付け、u-- をセレクタ二重化する', () => {
    const css = compileEntry('main_no_layer.scss');

    expect(css).toMatch(/\.-ta\\:center \{\s*text-align: center\s+!important;/);
    expect(css).toContain('.u--trim.u--trim {');
    expect(css).toContain('.u--trimAll.u--trimAll > :not(');
    expect(css).toContain('.u--cbox.u--cbox {');
    expect(css).toContain('.u--divide.u--divide, .u--enclose.u--enclose {');
    expect(css).toContain(':where(.-bd, [class*=" -bd-"], [class^=-bd-]) {');
    // 二重化対象外
    expect(css).toContain('.u--srOnly:not(#_) {');
    expect(css).toContain('.u--clipText {');
  });

  test('main（@layer あり）は setting の既定どおり !important なし・二重化なし', () => {
    const css = compileEntry('main.scss');

    expect(css).toMatch(/\.-ta\\:center \{\s*text-align: center;/);
    expect(css).toContain('.u--trim {');
    expect(css).not.toContain('.u--trim.u--trim');
    expect(css).toMatch(/@layer lism-base \{\s*\.-bd, \[class\*=" -bd-"\], \[class\^=-bd-\] \{/);
  });

  test('単体エントリ utility/index.scss は $layer_mode 既定のため二重化しない', () => {
    const css = compileEntry('utility/index.scss');

    expect(css).toContain('.u--trim {');
    expect(css).not.toContain('.u--trim.u--trim');
  });

  test('setting を先に設定済みでも main_no_layer を読み込める（SCSS bridge 経路）', () => {
    // $default_important: 0 を渡しても no_layer では !important が付く
    const css = compileString(`
@use './setting' with ($default_important: 0);
@use './main_no_layer';
`);

    expect(css).toMatch(/\.-ta\\:center \{\s*text-align: center\s+!important;/);
  });
});
