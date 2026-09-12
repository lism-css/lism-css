// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type GearProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Gear = /* @__PURE__ */ forwardRef<SVGSVGElement, GearProps>(function Gear(
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
      <path d="M9.682,4.867l-.027-1.824c-.006-.419.331-.761.75-.761h3.19c.419,0,.756.343.75.761l-.027,1.824c1,.325,1.92.856,2.701,1.559l1.566-.936c.359-.215.825-.094,1.034.269l1.595,2.762c.209.363.081.826-.284,1.03l-1.594.889c.219,1.028.219,2.091,0,3.119l1.594.889c.366.204.494.668.284,1.03l-1.595,2.762c-.209.363-.675.484-1.034.269l-1.566-.936c-.781.703-1.701,1.235-2.701,1.559l.027,1.824c.006.419-.331.761-.75.761h-3.19c-.419,0-.756-.343-.75-.761l.027-1.824c-1-.325-1.92-.856-2.701-1.559l-1.566.936c-.359.215-.825.094-1.034-.269l-1.595-2.762c-.209-.363-.081-.826.284-1.03l1.594-.889c-.219-1.028-.219-2.091,0-3.119l-1.594-.889c-.366-.204-.494-.668-.284-1.03l1.595-2.762c.209-.363.675-.484,1.034-.269l1.566.936c.781-.703,1.701-1.235,2.701-1.559Z" />
      <circle cx="12" cy="12" r="2.5" />
      {children}
    </svg>
  );
});

export default Gear;
