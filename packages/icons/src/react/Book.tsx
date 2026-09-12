// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type BookProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Book = /* @__PURE__ */ forwardRef<SVGSVGElement, BookProps>(function Book(
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
      <path d="M4,4.75c0-1.243,1.007-2.25,2.25-2.25h13c.414,0,.75.336.75.75v17.5c0,.414-.336.75-.75.75H6.25c-1.243,0-2.25-1.007-2.25-2.25V4.75Z" />
      <path d="M4,19.25c0-.414.336-.75.75-.75h15.25" />
      <path d="M8,6.5h8" />
      {children}
    </svg>
  );
});

export default Book;
