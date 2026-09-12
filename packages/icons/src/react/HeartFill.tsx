// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type HeartFillProps = SVGProps<SVGSVGElement> & { size?: number | string };
const HeartFill = /* @__PURE__ */ forwardRef<SVGSVGElement, HeartFillProps>(function HeartFill(
  { children, size = '1em', width = size, height = size, ...props },
  ref
) {
  const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      width={width}
      height={height}
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <path d="M12,3.941c-1.118-.891-2.505-1.376-3.935-1.376-3.488,0-6.315,2.827-6.315,6.315,0,.875.182,1.741.534,2.542,1.836,4.175,4.997,7.629,8.993,9.827.221.122.47.186.723.186s.502-.064.723-.186c3.996-2.198,7.157-5.652,8.993-9.827.352-.801.534-1.667.534-2.542,0-3.488-2.827-6.315-6.315-6.315-1.43,0-2.817.485-3.935,1.376Z" />
      {children}
    </svg>
  );
});

export default HeartFill;
