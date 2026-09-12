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
      <path d="M12,3h-6.75c-1.243,0-2.25,1.007-2.25,2.25v13.5c0,1.243,1.007,2.25,2.25,2.25h6.75" />
      <path d="M9,12h12" />
      <path d="M17,8l4,4-4,4" />
      {children}
    </svg>
  );
});

export default SignOut;
