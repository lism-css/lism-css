// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type QuestionProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Question = /* @__PURE__ */ forwardRef<SVGSVGElement, QuestionProps>(function Question(
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
      <circle cx="12" cy="16.875" r=".375" />
      <path d="M12,13.5v-.75c1.657,0,3-1.176,3-2.625s-1.343-2.625-3-2.625-3,1.176-3,2.625v.375" />
      <circle cx="12" cy="12" r="9" />
      {children}
    </svg>
  );
});

export default Question;
