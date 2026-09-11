// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type UserProps = SVGProps<SVGSVGElement> & { size?: number | string };
const User = /* @__PURE__ */ forwardRef<SVGSVGElement, UserProps>(function User(
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
      <circle cx="12" cy="9" r="6" />
      <path d="M3,20.25c1.816-3.138,5.114-5.25,9-5.25s7.184,2.112,9,5.25" />
      {children}
    </svg>
  );
});

export default User;
