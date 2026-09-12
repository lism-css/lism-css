// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type CaretUpFillProps = SVGProps<SVGSVGElement> & { size?: number | string };
const CaretUpFill = /* @__PURE__ */ forwardRef<SVGSVGElement, CaretUpFillProps>(function CaretUpFill(
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
      <path d="M19.5,16.5H4.5c-.303,0-.577-.183-.693-.463s-.052-.603.163-.817l6.97-6.97c.586-.586,1.536-.586,2.121,0l6.97,6.97c.214.214.279.537.163.817s-.39.463-.693.463Z" />
      {children}
    </svg>
  );
});

export default CaretUpFill;
