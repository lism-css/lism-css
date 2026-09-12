// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type InfoProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Info = /* @__PURE__ */ forwardRef<SVGSVGElement, InfoProps>(function Info(
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
      <path d="M9.5,16.25h5" />
      <circle cx="12" cy="12" r="10" />
      <circle cx="11.875" cy="7.375" r=".375" />
      <path d="M10.125,10.681h1.125c.414,0,.75.336.75.75v4.819" />
      {children}
    </svg>
  );
});

export default Info;
