// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const NoteFill = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function NoteFill({ children, ...props }, ref) {
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
      <path
        d="M9.5,16.265c-.525.105-.976-.032-1.355-.41-.378-.378-.515-.83-.41-1.355l.485-2.424c.059-.297.196-.552.41-.766L16.939,3c.293-.293.646-.439,1.061-.439s.768.146,1.061.439l1.939,1.939c.293.293.439.646.439,1.061s-.146.768-.439,1.061l-8.309,8.309c-.214.214-.47.351-.766.41l-2.424.485ZM18.75,7.189l1.189-1.189-1.939-1.939-1.189,1.189,1.939,1.939Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M11.25,3h-6c-1.243,0-2.25,1.007-2.25,2.25v13.5c0,1.243,1.007,2.25,2.25,2.25h13.5c1.243,0,2.25-1.007,2.25-2.25v-6" />
      {children}
    </svg>
  );
});

export default NoteFill;
