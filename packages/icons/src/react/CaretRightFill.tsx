// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type CaretRightFillProps = SVGProps<SVGSVGElement> & { size?: number | string };
const CaretRightFill = /* @__PURE__ */ forwardRef<SVGSVGElement, CaretRightFillProps>(function CaretRightFill(
  { children, size = '1em', width = size, height = size, ...props },
  ref
) {
  const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      width={width}
      height={height}
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <path d="M7.5,19.5V4.5c0-.303.183-.577.463-.693s.603-.052.817.163l6.97,6.97c.586.586.586,1.536,0,2.121l-6.97,6.97c-.214.214-.537.279-.817.163s-.463-.39-.463-.693Z" />
      {children}
    </svg>
  );
});

export default CaretRightFill;
