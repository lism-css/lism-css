// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type TagProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Tag = /* @__PURE__ */ forwardRef<SVGSVGElement, TagProps>(function Tag({ children, size = '1em', width = size, height = size, ...props }, ref) {
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
      <path d="M4.5,5.25c0-.414.336-.75.75-.75h7.939c.199,0,.39.079.53.22l7.189,7.189c.879.879.879,2.303,0,3.182l-5.818,5.818c-.879.879-2.303.879-3.182,0l-7.189-7.189c-.141-.141-.22-.331-.22-.53v-7.939Z" />
      <circle cx="7.875" cy="7.875" r=".375" />
      {children}
    </svg>
  );
});

export default Tag;
