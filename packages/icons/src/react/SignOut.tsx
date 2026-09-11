// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type SignOutProps = SVGProps<SVGSVGElement> & { size?: number | string };
const SignOut = /* @__PURE__ */ forwardRef<SVGSVGElement, SignOutProps>(function SignOut(
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
      <polyline points="10.5 3.75 4.5 3.75 4.5 20.25 10.5 20.25" />
      <line x1="10.5" y1="12" x2="21" y2="12" />
      <polyline points="17.25 8.25 21 12 17.25 15.75" />
      {children}
    </svg>
  );
});

export default SignOut;
