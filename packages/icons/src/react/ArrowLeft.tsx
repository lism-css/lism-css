// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type ArrowLeftProps = SVGProps<SVGSVGElement> & { size?: number | string };
const ArrowLeft = /* @__PURE__ */ forwardRef<SVGSVGElement, ArrowLeftProps>(function ArrowLeft(
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
      <path d="M21.5,12H2.5" />
      <path d="M8.833,18.333l-6.333-6.333,6.333-6.333" />
      {children}
    </svg>
  );
});

export default ArrowLeft;
