// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type StarProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Star = /* @__PURE__ */ forwardRef<SVGSVGElement, StarProps>(function Star(
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
      <path d="M12,1.945c.285,0,.546.162.673.418l2.386,4.834c.109.221.32.375.565.41l5.335.775c.283.041.517.239.605.51s.015.57-.19.769l-3.86,3.763c-.177.172-.257.421-.216.664l.911,5.313c.048.281-.067.566-.298.734s-.537.19-.79.057l-4.772-2.509c-.108-.057-.227-.086-.349-.086s-.241.03-.349.086l-4.772,2.509c-.253.133-.559.111-.79-.057s-.347-.452-.298-.734l.911-5.313c.042-.243-.039-.492-.216-.664l-3.86-3.763c-.204-.199-.278-.497-.19-.769s.323-.469.605-.51l5.335-.775c.244-.035.455-.189.565-.41l2.386-4.834c.126-.256.387-.418.673-.418Z" />
      {children}
    </svg>
  );
});

export default Star;
