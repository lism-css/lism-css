// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type CheckCircleProps = SVGProps<SVGSVGElement> & { size?: number | string };
const CheckCircle = /* @__PURE__ */ forwardRef<SVGSVGElement, CheckCircleProps>(function CheckCircle(
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
      <polyline points="8.25 12.75 10.5 15 15.75 9.75" />
      <circle cx="12" cy="12" r="9" />
      {children}
    </svg>
  );
});

export default CheckCircle;
