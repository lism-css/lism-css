// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const LockFill = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function LockFill({ children, ...props }, ref) {
  const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      width="1em"
      height="1em"
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <path d="M3.25,12.333c0-2,1-3,3-3v-2.583c0-1.588.561-2.943,1.684-4.066,1.123-1.123,2.478-1.684,4.066-1.684,1.588,0,2.943.561,4.066,1.684,1.123,1.123,1.684,2.478,1.684,4.066v2.583c2,0,3,1,3,3v6.167c0,2-1,3-3,3H6.25c-2,0-3-1-3-3v-6.167ZM7.75,9.333h8.5v-2.583c0-1.174-.415-2.175-1.245-3.005-.83-.83-1.832-1.245-3.005-1.245-1.174,0-2.175.415-3.005,1.245s-1.245,1.832-1.245,3.005v2.583ZM13.125,15.417c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125,1.125.504,1.125,1.125,1.125,1.125-.504,1.125-1.125Z" />
      {children}
    </svg>
  );
});

export default LockFill;
