// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type CartProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Cart = /* @__PURE__ */ forwardRef<SVGSVGElement, CartProps>(function Cart(
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
      <path d="M2.053,2.5h1.725c.351,0,.655.243.732.585l3.168,14.079c.077.342.381.585.732.585h10.153" />
      <path d="M5.25,6.375h14.062c.228,0,.443.104.586.281s.196.411.146.633l-1.35,6c-.077.342-.381.585-.732.585H6.937" />
      <circle cx="8.569" cy="21.125" r=".375" />
      <circle cx="18.187" cy="21.125" r=".375" />
      {children}
    </svg>
  );
});

export default Cart;
