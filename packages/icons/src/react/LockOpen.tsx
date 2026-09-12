// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type LockOpenProps = SVGProps<SVGSVGElement> & { size?: number | string };
const LockOpen = /* @__PURE__ */ forwardRef<SVGSVGElement, LockOpenProps>(function LockOpen(
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
      <rect x="4" y="10.083" width="16" height="10.667" rx="2.25" ry="2.25" />
      <path d="M7,10.083v-3.333c0-2.761,2.239-5,5-5s5,2.239,5,5" />
      <circle cx="12" cy="15.417" r=".375" />
      {children}
    </svg>
  );
});

export default LockOpen;
