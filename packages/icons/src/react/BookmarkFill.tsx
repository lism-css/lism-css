// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const BookmarkFill = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function BookmarkFill({ children, ...props }, ref) {
  const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      width="1em"
      height="1em"
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <path d="M17.25,3H6.75c-.828,0-1.5.672-1.5,1.5v16.5c0,.414.336.75.75.75.14,0,.278-.04.397-.114l5.603-3.502,5.603,3.502c.352.219.814.112,1.033-.24.074-.119.113-.256.113-.396V4.5c0-.828-.672-1.5-1.5-1.5Z" />
      {children}
    </svg>
  );
});

export default BookmarkFill;
