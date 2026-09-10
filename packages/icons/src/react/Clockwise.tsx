// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Clockwise = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Clockwise({ children, ...props }, ref) {
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
      <polyline points="12 7.5 12 12 15.75 14.25" />
      <polyline points="17.25 9.75 21 9.75 21 6" />
      <path d="M17.662,18c-3.314,3.127-8.535,2.976-11.662-.338-3.127-3.314-2.976-8.535.338-11.662,3.246-3.063,8.34-2.989,11.496.167,1.103,1.118,2.015,2.171,3.166,3.584" />
      {children}
    </svg>
  );
});

export default Clockwise;
