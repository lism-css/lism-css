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
      <rect x="3.75" y="8.25" width="16.5" height="12" rx=".75" ry=".75" />
      <circle cx="12" cy="14.25" r=".375" />
      <path d="M8.25,8.25v-3c0-2.071,1.679-3.75,3.75-3.75,1.814,0,3.402,1.288,3.75,3" />
      {children}
    </svg>
  );
});

export default LockOpen;
