// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type StarFillProps = SVGProps<SVGSVGElement> & { size?: number | string };
const StarFill = /* @__PURE__ */ forwardRef<SVGSVGElement, StarFillProps>(function StarFill(
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
      <path d="M12,1.195c.571,0,1.092.324,1.345.836l2.386,4.834,5.335.775c.565.082,1.034.478,1.211,1.021s.029,1.139-.38,1.538l-3.86,3.763.911,5.313c.097.563-.135,1.131-.597,1.467s-1.074.38-1.58.114l-4.772-2.509-4.772,2.509c-.505.266-1.118.221-1.58-.114s-.693-.904-.597-1.467l.911-5.313-3.86-3.763c-.409-.399-.556-.995-.38-1.538s.646-.939,1.211-1.021l5.335-.775,2.386-4.834c.253-.512.774-.836,1.345-.836Z" />
      {children}
    </svg>
  );
});

export default StarFill;
