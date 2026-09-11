// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type ArrowDownProps = SVGProps<SVGSVGElement> & { size?: number | string };
const ArrowDown = /* @__PURE__ */ forwardRef<SVGSVGElement, ArrowDownProps>(function ArrowDown(
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
      <line x1="12" y1="3.75" x2="12" y2="20.25" />
      <polyline points="5.25 13.5 12 20.25 18.75 13.5" />
      {children}
    </svg>
  );
});

export default ArrowDown;
