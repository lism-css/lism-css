// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const HeartFill = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function HeartFill({ children, ...props }, ref) {
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
      <path d="M22.5,9.562c0,6.562-9.73,11.874-10.145,12.094-.222.119-.489.119-.711,0-.414-.219-10.145-5.531-10.145-12.094.004-3.209,2.604-5.809,5.812-5.812,1.936,0,3.631.833,4.688,2.24,1.057-1.407,2.752-2.24,4.688-2.24,3.209.004,5.809,2.604,5.812,5.812Z" />
      {children}
    </svg>
  );
});

export default HeartFill;
