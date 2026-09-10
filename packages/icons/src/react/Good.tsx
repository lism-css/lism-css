// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Good = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Good({ children, ...props }, ref) {
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
      <path d="M3,9.75h4.5v9.75H3c-.414,0-.75-.336-.75-.75v-8.25c0-.414.336-.75.75-.75Z" />
      <path d="M7.5,9.75l3.75-7.5c1.657,0,3,1.343,3,3v2.25h6c.828,0,1.5.672,1.5,1.5,0,.063-.004.125-.012.187l-1.125,9c-.094.75-.732,1.312-1.488,1.312H7.5" />
      {children}
    </svg>
  );
});

export default Good;
