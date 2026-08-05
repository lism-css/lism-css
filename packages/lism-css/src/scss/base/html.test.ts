import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';
import { describe, expect, test } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

function compileHtml(): string {
  const result = sass.compileString(`@use './html';`, {
    url: pathToFileURL(resolve(currentDir, '__html_test.scss')),
  });

  return result.css;
}

// フォーム要素の既定スタイルが `.set--plain` (0,1,0) に詳細度で負けないよう、
// input セレクタの :not() は :where() で包んで詳細度をゼロにしている（#535）。
describe('form fields default style specificity', () => {
  test('input selector wraps :not() in :where() to keep specificity at (0,0,1)', () => {
    const css = compileHtml();

    expect(css).toContain(':where(:not([type=range]))');
    expect(css).not.toMatch(/input:not\(/);
  });
});
