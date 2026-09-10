// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Tag = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Tag({ children, ...props }, ref) {
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
      <path d="M3.969,12.969c-.14-.141-.219-.331-.219-.53V3.75h8.69c.199,0,.389.079.53.219l9.311,9.311c.293.293.293.767,0,1.06l-7.937,7.94c-.293.293-.767.293-1.06,0L3.969,12.969Z" />
      <circle cx="7.875" cy="7.875" r=".375" />
      {children}
    </svg>
  );
});

export default Tag;
