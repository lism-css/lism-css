// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type DotsProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Dots = /* @__PURE__ */ forwardRef<SVGSVGElement, DotsProps>(function Dots(
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
      <circle cx="6" cy="12" r=".375" />
      <circle cx="12" cy="12" r=".375" />
      <circle cx="18" cy="12" r=".375" />
      {children}
    </svg>
  );
});

export default Dots;
