// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Warning = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Warning({ children, ...props }, ref) {
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
      <path d="M13.351,3.771l8.199,14.238c.575,1.003-.168,2.242-1.351,2.242H3.801c-1.183,0-1.926-1.238-1.351-2.242L10.649,3.771c.591-1.028,2.111-1.028,2.702,0Z" />
      <line x1="12" y1="13.5" x2="12" y2="9.75" />
      <circle cx="12" cy="16.875" r=".375" />
      {children}
    </svg>
  );
});

export default Warning;
