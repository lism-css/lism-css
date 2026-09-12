// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type BookmarkFillProps = SVGProps<SVGSVGElement> & { size?: number | string };
const BookmarkFill = /* @__PURE__ */ forwardRef<SVGSVGElement, BookmarkFillProps>(function BookmarkFill(
  { children, size = '1em', width = size, height = size, ...props },
  ref
) {
  const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      width={width}
      height={height}
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <path d="M4.5,5.25c0-1.657,1.343-3,3-3h9c1.657,0,3,1.343,3,3v14.475c0,.531-.281,1.023-.739,1.293s-1.025.277-1.489.018l-5.272-2.929-5.272,2.929c-.465.258-1.031.251-1.489-.018s-.739-.761-.739-1.293V5.25Z" />
      {children}
    </svg>
  );
});

export default BookmarkFill;
