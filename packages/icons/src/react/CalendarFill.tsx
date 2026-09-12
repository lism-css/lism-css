// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type CalendarFillProps = SVGProps<SVGSVGElement> & { size?: number | string };
const CalendarFill = /* @__PURE__ */ forwardRef<SVGSVGElement, CalendarFillProps>(function CalendarFill(
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
      <path
        d="M21.75,9.25v9.75c0,2-1,3-3,3H5.25c-2,0-3-1-3-3v-9.75c0-.049.005-.098.014-.146.01-.048.024-.095.043-.141s.042-.089.069-.13c.027-.041.058-.079.093-.114.035-.035.073-.066.114-.093s.084-.05.13-.069.092-.033.141-.043c.048-.01.097-.014.146-.014h18c.049,0,.098.005.146.014s.095.024.141.043.089.042.13.069c.041.027.079.058.114.093s.066.073.093.114c.027.041.05.084.069.13.019.045.033.092.043.141.01.048.014.097.014.146ZM13.125,13.25c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125,1.125.504,1.125,1.125,1.125,1.125-.504,1.125-1.125ZM17.625,13.25c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125,1.125.504,1.125,1.125,1.125,1.125-.504,1.125-1.125ZM13.125,17.25c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125,1.125.504,1.125,1.125,1.125,1.125-.504,1.125-1.125ZM8.625,17.25c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125,1.125.504,1.125,1.125,1.125,1.125-.504,1.125-1.125ZM8.625,13.25c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125,1.125.504,1.125,1.125,1.125,1.125-.504,1.125-1.125Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M3,7c0-1.243,1.007-2.25,2.25-2.25h13.5c1.243,0,2.25,1.007,2.25,2.25v12c0,1.243-1.007,2.25-2.25,2.25H5.25c-1.243,0-2.25-1.007-2.25-2.25V7Z" />
      <path d="M3,9.25h18" />
      <path d="M16.5,2.75v3.25" />
      <path d="M7.5,2.75v3.25" />
      {children}
    </svg>
  );
});

export default CalendarFill;
