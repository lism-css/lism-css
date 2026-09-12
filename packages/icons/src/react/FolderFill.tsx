// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const FolderFill = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function FolderFill({ children, ...props }, ref) {
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
      <path d="M1.75,6.333c0-2,1-3,3-3h3.773c.414,0,.768.146,1.061.439l2.727,2.727h6.939c2,0,3,1,3,3v8.167c0,2-1,3-3,3H4.75c-2,0-3-1-3-3V6.333Z" />
      {children}
    </svg>
  );
});

export default FolderFill;
