import { describe, it, expect } from 'vitest';
import { findHtmlIssue } from './validate';

describe('findHtmlIssue', () => {
  it('対応が取れた HTML は null', () => {
    expect(findHtmlIssue('<div class="l--box"><p>hello</p></div>')).toBeNull();
  });

  it('閉じ漏れを検知する', () => {
    expect(findHtmlIssue('<div><span>a</div>')).not.toBeNull();
    expect(findHtmlIssue('<div>a')).not.toBeNull();
  });

  it('対応しない閉じタグを検知する', () => {
    expect(findHtmlIssue('<div>a</span></div>')).not.toBeNull();
  });

  it('書きかけのタグを検知する', () => {
    expect(findHtmlIssue('<div class="x"')).not.toBeNull();
  });

  it('未終了コメントを検知する', () => {
    expect(findHtmlIssue('<!-- x')).not.toBeNull();
  });

  it('void 要素は閉じタグを要求しない', () => {
    expect(findHtmlIssue('<div><br><img src="a.png"></div>')).toBeNull();
    expect(findHtmlIssue('<div><br /><img src="a.png" /></div>')).toBeNull();
  });

  it('省略可能な終了タグは valid', () => {
    expect(findHtmlIssue('<p>a<p>b')).toBeNull();
    expect(findHtmlIssue('<div><p>a</div>')).toBeNull();
  });

  it('地の文の < はタグとして扱わない', () => {
    expect(findHtmlIssue('<p>a < b</p>')).toBeNull();
  });

  it('raw text 要素の中身はタグとして解釈しない', () => {
    expect(findHtmlIssue('<div><textarea>a < b</textarea></div>')).toBeNull();
  });

  // 引用符なし属性値（ブラウザは valid として解釈するので警告を出さない）
  it('引用符なし属性値の末尾の / を自己終了と誤認しない', () => {
    expect(findHtmlIssue('<a href=https://lism-css.com/>Link</a>')).toBeNull();
  });

  it('引用符なし属性値の中の引用符を区切りと誤認しない', () => {
    expect(findHtmlIssue("<div title=it's>x</div>")).toBeNull();
  });

  it('引用符付き属性値の中の > はタグの終わりではない', () => {
    expect(findHtmlIssue('<div title="a > b">x</div>')).toBeNull();
  });

  // 自己終了スラッシュが効くのは外来コンテンツ（SVG / MathML）だけ
  it('HTML 要素の <div/> は開始タグとして扱う', () => {
    expect(findHtmlIssue('<div/>text</div>')).toBeNull();
    expect(findHtmlIssue('<div/>text')).not.toBeNull();
  });

  it('SVG の自己終了タグは閉じたものとして扱う', () => {
    expect(findHtmlIssue('<svg><circle /></svg>')).toBeNull();
    expect(findHtmlIssue('<div><svg><path d="M0 0"/></svg></div>')).toBeNull();
  });
});
