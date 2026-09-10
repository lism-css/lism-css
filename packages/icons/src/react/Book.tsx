// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Book = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Book({ children, ...props }, ref) {
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
      width="1em"
      height="1em"
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <path d="M4.5,20.25c0-1.243,1.007-2.25,2.25-2.25h12.75V3H6.75c-1.243,0-2.25,1.007-2.25,2.25v15Z" />
      <polyline points="4.5 20.25 4.5 21 18 21" />
      {children}
    </svg>
  );
});

export default Book;
