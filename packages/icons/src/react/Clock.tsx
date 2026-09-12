// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type ClockProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Clock = /* @__PURE__ */ forwardRef<SVGSVGElement, ClockProps>(function Clock(
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12,6v6l3.354,1.677" />
      {children}
    </svg>
  );
});

export default Clock;
