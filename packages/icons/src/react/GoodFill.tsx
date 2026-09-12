// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const GoodFill = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function GoodFill({ children, ...props }, ref) {
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
      <path
        d="M7.05,11.4c2.584-1.938,3.978-4.52,4.179-7.744.059-.938.558-1.406,1.497-1.406h.023c2,0,3,1,3,3v3h2.948c1.853,0,2.85.924,2.991,2.771.04.527.06,1.054.06,1.583,0,2.471-.428,4.866-1.284,7.185-.483,1.307-1.421,1.961-2.814,1.961h-7.902c-2,0-3-1-3-3v-6.75c0-.118.026-.23.079-.335s.126-.194.221-.265Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M3,12c0-1.243,1.007-2.25,2.25-2.25s2.25,1.007,2.25,2.25v6.75c0,1.243-1.007,2.25-2.25,2.25s-2.25-1.007-2.25-2.25v-6.75Z" />
      {children}
    </svg>
  );
});

export default GoodFill;
