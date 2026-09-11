// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type SearchProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Search = /* @__PURE__ */ forwardRef<SVGSVGElement, SearchProps>(function Search(
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
      <circle cx="10.5" cy="10.5" r="7.5" />
      <line x1="15.803" y1="15.803" x2="21" y2="21" />
      {children}
    </svg>
  );
});

export default Search;
