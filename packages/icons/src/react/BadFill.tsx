// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type BadFillProps = SVGProps<SVGSVGElement> & { size?: number | string };
const BadFill = /* @__PURE__ */ forwardRef<SVGSVGElement, BadFillProps>(function BadFill(
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
        d="M7.05,12.6c-.094-.071-.168-.159-.221-.265s-.079-.217-.079-.335v-6.75c0-2,1-3,3-3h7.902c1.394,0,2.332.654,2.814,1.961.856,2.319,1.284,4.714,1.284,7.185,0,.528-.02,1.056-.06,1.583-.141,1.847-1.138,2.771-2.991,2.771h-2.948v3c0,2-1,3-3,3h-.023c-.939,0-1.438-.469-1.497-1.406-.202-3.224-1.595-5.805-4.179-7.744Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M3,12c0,1.243,1.007,2.25,2.25,2.25s2.25-1.007,2.25-2.25v-6.75c0-1.243-1.007-2.25-2.25-2.25s-2.25,1.007-2.25,2.25v6.75Z" />
      {children}
    </svg>
  );
});

export default BadFill;
