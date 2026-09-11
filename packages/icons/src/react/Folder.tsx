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
      <path d="M21,8.25v10.583c0,.368-.298.667-.667.667H3.75c-.414,0-.75-.336-.75-.75V6c0-.414.336-.75.75-.75h5c.162,0,.32.053.45.15l2.8,2.1h8.25c.414,0,.75.336.75.75Z" />
      {children}
    </svg>
  );
});

export default Folder;
