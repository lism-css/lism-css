// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type SignInProps = SVGProps<SVGSVGElement> & { size?: number | string };
const SignIn = /* @__PURE__ */ forwardRef<SVGSVGElement, SignInProps>(function SignIn(
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
      <path d="M12,3h6.75c1.243,0,2.25,1.007,2.25,2.25v13.5c0,1.243-1.007,2.25-2.25,2.25h-6.75" />
      <path d="M3,12h12" />
      <path d="M11,8l4,4-4,4" />
      {children}
    </svg>
  );
});

export default SignIn;
