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
      <line x1="2.25" y1="12" x2="12.75" y2="12" />
      <polyline points="9 8.25 12.75 12 9 15.75" />
      <polyline points="12.75 3.75 18.75 3.75 18.75 20.25 12.75 20.25" />
      {children}
    </svg>
  );
});

export default SignIn;
