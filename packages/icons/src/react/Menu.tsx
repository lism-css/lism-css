// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type MenuProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Menu = /* @__PURE__ */ forwardRef<SVGSVGElement, MenuProps>(function Menu(
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
      <path d="M2.5,5.667h19" />
      <path d="M2.5,12h19" />
      <path d="M2.5,18.333h19" />
      {children}
    </svg>
  );
});

export default Menu;
