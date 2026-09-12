// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type BookmarkProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Bookmark = /* @__PURE__ */ forwardRef<SVGSVGElement, BookmarkProps>(function Bookmark(
  { children, size = '1em', width = size, height = size, ...props },
  ref
) {
  const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <path d="M5.25,5.25c0-1.243,1.007-2.25,2.25-2.25h9c1.243,0,2.25,1.007,2.25,2.25v14.475c0,.266-.141.512-.37.646s-.512.138-.745.009l-5.272-2.929c-.227-.126-.502-.126-.728,0l-5.272,2.929c-.232.129-.516.126-.745-.009s-.37-.381-.37-.646V5.25Z" />
      {children}
    </svg>
  );
});

export default Bookmark;
