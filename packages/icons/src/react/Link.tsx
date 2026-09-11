// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type LinkProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Link = /* @__PURE__ */ forwardRef<SVGSVGElement, LinkProps>(function Link(
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
      <path d="M13.254,6.064l1.031-1.031c1.707-1.707,4.474-1.707,6.181,0,0,0,0,0,0,0h0c1.707,1.707,1.707,4.474,0,6.181,0,0,0,0,0,0l-2.286,2.286-.969.969c-1.707,1.707-4.475,1.708-6.182,0-.002-.002-.003-.003-.005-.005h0c-.849-.848-1.31-2.009-1.275-3.209" />
      <path d="M10.746,17.936l-1.031,1.031c-1.707,1.707-4.475,1.708-6.182,0-.002-.002-.003-.003-.005-.005h0c-1.702-1.708-1.7-4.472.006-6.177l3.255-3.255c1.707-1.707,4.474-1.707,6.181,0,0,0,0,0,0,0h0c.852.848,1.316,2.012,1.281,3.214" />
      {children}
    </svg>
  );
});

export default Link;
