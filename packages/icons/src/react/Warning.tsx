// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type WarningProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Warning = /* @__PURE__ */ forwardRef<SVGSVGElement, WarningProps>(function Warning(
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
      <path d="M10.051,4.125c.402-.696,1.145-1.125,1.949-1.125s1.547.429,1.949,1.125l7.794,13.5c.402.696.402,1.554,0,2.25s-1.145,1.125-1.949,1.125H4.206c-.804,0-1.547-.429-1.949-1.125s-.402-1.554,0-2.25l7.794-13.5Z" />
      <path d="M12,7.75v6.25" />
      <circle cx="12" cy="17.375" r=".375" />
      {children}
    </svg>
  );
});

export default Warning;
