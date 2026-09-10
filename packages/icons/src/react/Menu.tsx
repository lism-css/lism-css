// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Menu = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Menu({ children, ...props }, ref) {
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
      width="1em"
      height="1em"
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <line x1="3.75" y1="12" x2="20.25" y2="12" />
      <line x1="3.75" y1="6" x2="20.25" y2="6" />
      <line x1="3.75" y1="18" x2="20.25" y2="18" />
      {children}
    </svg>
  );
});

export default Menu;
