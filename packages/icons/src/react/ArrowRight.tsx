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
      <line x1="3.75" y1="12" x2="20.25" y2="12" />
      <polyline points="13.5 5.25 20.25 12 13.5 18.75" />
      {children}
    </svg>
  );
});

export default ArrowRight;
