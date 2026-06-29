import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';
import { describe, expect, test } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const testProp = (bp: string) => `
  $props: (
    'zztest': (
      prop: 'padding',
      utilities: (
        '10': '10px',
      ),
      bp: ${bp},
      alwaysVar: 1,
    ),
  )
`;

function compileAutoOutput(settingOverrides: string): string {
  const result = sass.compileString(
    `
@use './setting' with (
${settingOverrides}
);
@use './auto_output';
`,
    {
      url: pathToFileURL(resolve(currentDir, '__auto_output_test.scss')),
      logger: {
        warn: () => {},
        debug: () => {},
      },
    }
  );

  return result.css;
}

describe('auto_output breakpoint output', () => {
  test('bp: 1 outputs default enabled breakpoints only', () => {
    const css = compileAutoOutput(testProp('1'));

    expect(css).not.toContain('.-zztest_xs');
    expect(css).toContain('.-zztest_sm');
    expect(css).toContain('.-zztest_md');
    expect(css).toContain('.-zztest_lg');
    expect(css).not.toContain('.-zztest_xl');
  });

  test('bp: 1 outputs xs and xl when breakpoints define their sizes', () => {
    const css = compileAutoOutput(`
  $breakpoints: (
    'xs': '360px',
    'xl': '1440px',
  ),
${testProp('1')}
`);

    expect(css).toContain('.-zztest_xs');
    expect(css).toContain('.-zztest_sm');
    expect(css).toContain('.-zztest_md');
    expect(css).toContain('.-zztest_lg');
    expect(css).toContain('.-zztest_xl');
  });

  test('bp list outputs only explicitly listed breakpoints', () => {
    const css = compileAutoOutput(`
  $breakpoints: (
    'xs': '360px',
    'xl': '1440px',
  ),
${testProp("('sm', 'md')")}
`);

    expect(css).not.toContain('.-zztest_xs');
    expect(css).toContain('.-zztest_sm');
    expect(css).toContain('.-zztest_md');
    expect(css).not.toContain('.-zztest_lg');
    expect(css).not.toContain('.-zztest_xl');
  });

  test('bp string does not output breakpoint classes', () => {
    const css = compileAutoOutput(testProp("'md'"));

    expect(css).not.toContain('.-zztest_sm');
    expect(css).not.toContain('.-zztest_md');
    expect(css).not.toContain('.-zztest_lg');
  });
});
