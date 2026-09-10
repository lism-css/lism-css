// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

const Star = /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Star({ children, ...props }, ref) {
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
      width="1em"
      height="1em"
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <path d="M12,17.727l5.13,3.155c.372.226.856.107,1.082-.265.108-.178.141-.392.092-.595l-1.395-5.887,4.566-3.938c.329-.289.362-.79.073-1.119-.134-.152-.32-.247-.522-.266l-5.992-.487-2.308-5.588c-.164-.401-.621-.593-1.022-.429-.195.08-.35.234-.429.429l-2.308,5.588-5.992.487c-.436.038-.759.423-.721.859.018.206.115.396.272.531l4.566,3.938-1.395,5.882c-.103.423.156.849.579.952.203.049.417.016.595-.092l5.13-3.155Z" />
      {children}
    </svg>
  );
});

export default Star;
