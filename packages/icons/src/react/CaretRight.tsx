// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type CaretRightProps = SVGProps<SVGSVGElement> & { size?: number | string };
const CaretRight = /* @__PURE__ */ forwardRef<SVGSVGElement, CaretRightProps>(function CaretRight(
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
      <path d="M8.25,19.5l6.97-6.97c.141-.141.22-.331.22-.53s-.079-.39-.22-.53l-6.97-6.97" />
      {children}
    </svg>
  );
});

export default CaretRight;
