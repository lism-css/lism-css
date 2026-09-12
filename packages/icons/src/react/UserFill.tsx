// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type UserFillProps = SVGProps<SVGSVGElement> & { size?: number | string };
const UserFill = /* @__PURE__ */ forwardRef<SVGSVGElement, UserFillProps>(function UserFill(
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
      <path d="M2.147,21.2c1.877-4.3,5.161-6.45,9.853-6.45s7.976,2.15,9.853,6.45c.02.045.035.092.045.14.011.048.016.097.017.146,0,.049-.003.098-.012.147s-.022.096-.04.141c-.018.046-.04.089-.067.131-.027.041-.057.08-.091.115-.034.035-.071.067-.112.095-.04.028-.083.052-.128.072-.096.042-.196.063-.3.063H2.835c-.049,0-.098-.005-.146-.014-.048-.01-.095-.024-.141-.043-.045-.019-.089-.042-.13-.069-.041-.027-.079-.058-.114-.093s-.066-.073-.093-.114-.05-.084-.069-.13-.033-.092-.043-.141c-.01-.048-.014-.097-.014-.146,0-.104.021-.204.063-.3ZM12,1.75c1.588,0,2.943.561,4.066,1.684,1.123,1.123,1.684,2.478,1.684,4.066s-.561,2.943-1.684,4.066-2.478,1.684-4.066,1.684-2.943-.561-4.066-1.684c-1.123-1.123-1.684-2.478-1.684-4.066s.561-2.943,1.684-4.066c1.123-1.123,2.478-1.684,4.066-1.684Z" />
      {children}
    </svg>
  );
});

export default UserFill;
