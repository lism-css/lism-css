// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Calendar = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Calendar({ children, ...props }, ref) {
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
      width="1em"
      height="1em"
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx=".75" ry=".75" />
      <line x1="16.5" y1="2.25" x2="16.5" y2="5.25" />
      <line x1="7.5" y1="2.25" x2="7.5" y2="5.25" />
      <line x1="3.75" y1="8.25" x2="20.25" y2="8.25" />
      <circle cx="12" cy="12.375" r=".375" />
      <circle cx="16.125" cy="12.375" r=".375" />
      <circle cx="7.875" cy="16.125" r=".375" />
      <circle cx="12" cy="16.125" r=".375" />
      <circle cx="16.125" cy="16.125" r=".375" />
      {children}
    </svg>
  );
});

export default Calendar;
