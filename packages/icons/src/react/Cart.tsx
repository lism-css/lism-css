// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Cart = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Cart({ children, ...props }, ref) {
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
      <path d="M17.625,17.25h-9.078c-.725,0-1.346-.519-1.476-1.232L4.568,2.25h-2.318" />
      <circle cx="8.625" cy="19.125" r="1.875" />
      <circle cx="17.625" cy="19.125" r="1.875" />
      <path d="M6.614,13.5h11.77c.725,0,1.346-.519,1.476-1.232l1.14-6.268H5.25" />
      {children}
    </svg>
  );
});

export default Cart;
