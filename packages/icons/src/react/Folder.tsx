// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type FolderProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Folder = /* @__PURE__ */ forwardRef<SVGSVGElement, FolderProps>(function Folder(
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
      <path d="M2.5,6.333c0-1.243,1.007-2.25,2.25-2.25h3.773c.199,0,.39.079.53.22l2.727,2.727c.141.141.331.22.53.22h6.939c1.243,0,2.25,1.007,2.25,2.25v8.167c0,1.243-1.007,2.25-2.25,2.25H4.75c-1.243,0-2.25-1.007-2.25-2.25V6.333Z" />
      {children}
    </svg>
  );
});

export default Folder;
