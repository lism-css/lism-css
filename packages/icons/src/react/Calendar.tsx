// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type CalendarProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Calendar = /* @__PURE__ */ forwardRef<SVGSVGElement, CalendarProps>(function Calendar(
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
      <rect x="3" y="4.75" width="18" height="16.5" rx="2.25" ry="2.25" />
      <path d="M7.5,2.75v3.25" />
      <path d="M16.5,2.75v3.25" />
      <path d="M3,9.25h18" />
      <circle cx="7.5" cy="13.25" r=".375" />
      <circle cx="12" cy="13.25" r=".375" />
      <circle cx="16.5" cy="13.25" r=".375" />
      <circle cx="7.5" cy="17.25" r=".375" />
      <circle cx="12" cy="17.25" r=".375" />
      {children}
    </svg>
  );
});

export default Calendar;
