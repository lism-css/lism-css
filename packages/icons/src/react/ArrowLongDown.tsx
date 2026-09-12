// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type ArrowLongDownProps = SVGProps<SVGSVGElement> & { size?: number | string };
const ArrowLongDown = /* @__PURE__ */ forwardRef<SVGSVGElement, ArrowLongDownProps>(function ArrowLongDown(
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
      <path d="M12,2v20" />
      <path d="M17,17l-5,5-5-5" />
      {children}
    </svg>
  );
});

export default ArrowLongDown;
