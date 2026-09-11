// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type AlertProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Alert = /* @__PURE__ */ forwardRef<SVGSVGElement, AlertProps>(function Alert(
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
      <line x1="12" y1="12.75" x2="12" y2="7.5" />
      <path
        d="M15.417,3h-6.834c-.199,0-.39.079-.531.219l-4.833,4.833c-.141.141-.22.332-.219.531v6.834c0,.199.079.39.219.531l4.833,4.833c.141.141.332.22.531.219h6.834c.199,0,.39-.079.531-.219l4.833-4.833c.141-.141.22-.332.219-.531v-6.834c0-.199-.079-.39-.219-.531l-4.833-4.833c-.141-.141-.332-.22-.531-.219Z"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
      />
      <circle cx="12" cy="16.125" r=".375" />
      {children}
    </svg>
  );
});

export default Alert;
