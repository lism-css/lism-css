// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type BanProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Ban = /* @__PURE__ */ forwardRef<SVGSVGElement, BanProps>(function Ban({ children, size = '1em', width = size, height = size, ...props }, ref) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M4.929,4.929l14.142,14.142" />
      {children}
    </svg>
  );
});

export default Ban;
