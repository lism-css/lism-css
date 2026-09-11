// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type LightbulbProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Lightbulb = /* @__PURE__ */ forwardRef<SVGSVGElement, LightbulbProps>(function Lightbulb(
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
      <line x1="8.25" y1="21.75" x2="15.75" y2="21.75" />
      <path d="M7.378,15.656c-1.806-1.411-2.867-3.572-2.878-5.864-.023-4.065,3.255-7.448,7.319-7.542,4.141-.1,7.579,3.175,7.679,7.316.057,2.366-1.005,4.619-2.866,6.081-.554.429-.879,1.09-.882,1.791v.562c0,.414-.336.75-.75.75h-6c-.414,0-.75-.336-.75-.75v-.562c0-.696-.322-1.354-.872-1.781Z" />
      <path d="M12.75,5.25c1.875.316,3.432,1.875,3.75,3.75" />
      {children}
    </svg>
  );
});

export default Lightbulb;
