// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type XProps = SVGProps<SVGSVGElement> & { size?: number | string };
const X = /* @__PURE__ */ forwardRef<SVGSVGElement, XProps>(function X({ children, size = '1em', width = size, height = size, ...props }, ref) {
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
      <line x1="18.75" y1="5.25" x2="5.25" y2="18.75" />
      <line x1="18.75" y1="18.75" x2="5.25" y2="5.25" />
      {children}
    </svg>
  );
});

export default X;
