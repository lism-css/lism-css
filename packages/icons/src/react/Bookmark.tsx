// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type BookmarkProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Bookmark = /* @__PURE__ */ forwardRef<SVGSVGElement, BookmarkProps>(function Bookmark(
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
      <path d="M18,21l-6-3.75-6,3.75V4.5c0-.414.336-.75.75-.75h10.5c.414,0,.75.336.75.75v16.5Z" />
      {children}
    </svg>
  );
});

export default Bookmark;
