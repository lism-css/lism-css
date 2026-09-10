// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Heart = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Heart({ children, ...props }, ref) {
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
      <path d="M12,21S2.25,15.75,2.25,9.562c0-2.796,2.267-5.062,5.062-5.062,2.118,0,3.932,1.154,4.688,3,.756-1.846,2.57-3,4.688-3,2.796,0,5.062,2.267,5.062,5.062,0,6.188-9.75,11.438-9.75,11.438Z" />
      {children}
    </svg>
  );
});

export default Heart;
