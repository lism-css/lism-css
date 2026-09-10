// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const CaretDownFill = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function CaretDownFill({ children, ...props }, ref) {
  const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      width="1em"
      height="1em"
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <path d="M20.193,8.713c-.116-.28-.389-.463-.693-.463H4.5c-.414,0-.75.335-.751.749,0,.199.079.39.22.531l7.5,7.5c.293.293.768.293,1.061,0h0s7.5-7.501,7.5-7.501c.214-.215.278-.537.162-.818Z" />
      {children}
    </svg>
  );
});

export default CaretDownFill;
