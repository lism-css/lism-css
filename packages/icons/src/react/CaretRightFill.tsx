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
      <path d="M17.031,11.469l-7.5-7.5c-.293-.293-.768-.293-1.061,0-.141.141-.22.332-.22.531v15c0,.414.335.75.749.751.199,0,.39-.079.531-.22l7.5-7.5c.293-.293.293-.768,0-1.061,0,0,0,0,0,0Z" />
      {children}
    </svg>
  );
});

export default CaretRightFill;
