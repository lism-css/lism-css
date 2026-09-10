// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Gear = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Gear({ children, ...props }, ref) {
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
      <circle cx="12" cy="12" r="3.75" />
      <path d="M3.884,16.696c-.414-.714-.732-1.48-.944-2.277l1.573-1.969c-.018-.301-.018-.603,0-.904l-1.572-1.969c.212-.798.529-1.564.942-2.278l2.504-.281c.2-.225.413-.438.638-.638l.281-2.503c.713-.412,1.478-.727,2.274-.937l1.969,1.573c.301-.018.603-.018.904,0l1.969-1.572c.798.212,1.564.529,2.278.942l.281,2.504c.225.2.438.413.638.638l2.503.281c.414.714.732,1.48.944,2.277l-1.573,1.969c.018.301.018.603,0,.904l1.572,1.969c-.21.798-.526,1.564-.938,2.278l-2.504.281c-.2.225-.413.438-.638.638l-.281,2.503c-.714.414-1.48.732-2.277.944l-1.969-1.573c-.301.018-.603.018-.904,0l-1.969,1.572c-.798-.21-1.564-.526-2.278-.938l-.281-2.504c-.225-.2-.438-.413-.638-.638l-2.505-.293Z" />
      {children}
    </svg>
  );
});

export default Gear;
