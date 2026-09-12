// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type GoodProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Good = /* @__PURE__ */ forwardRef<SVGSVGElement, GoodProps>(function Good(
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
      <path d="M3,12c0-1.243,1.007-2.25,2.25-2.25s2.25,1.007,2.25,2.25v6.75c0,1.243-1.007,2.25-2.25,2.25s-2.25-1.007-2.25-2.25v-6.75Z" />
      <path d="M7.5,12c2.635-1.977,4.272-5.009,4.478-8.297.025-.395.353-.703.749-.703h.023c1.243,0,2.25,1.007,2.25,2.25v3c0,.414.336.75.75.75h2.948c1.176,0,2.154.906,2.243,2.078.039.508.058,1.016.058,1.525,0,2.363-.419,4.708-1.237,6.925-.326.884-1.169,1.471-2.111,1.471h-7.902c-1.243,0-2.25-1.007-2.25-2.25" />
      {children}
    </svg>
  );
});

export default Good;
