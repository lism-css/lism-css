// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type ArrowRightProps = SVGProps<SVGSVGElement> & { size?: number | string };
const ArrowRight = /* @__PURE__ */ forwardRef<SVGSVGElement, ArrowRightProps>(function ArrowRight(
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
      <path d="M2.5,12h19" />
      <path d="M15.167,5.667l6.333,6.333-6.333,6.333" />
      {children}
    </svg>
  );
});

export default ArrowRight;
