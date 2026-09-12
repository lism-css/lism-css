// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type TagFillProps = SVGProps<SVGSVGElement> & { size?: number | string };
const TagFill = /* @__PURE__ */ forwardRef<SVGSVGElement, TagFillProps>(function TagFill(
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
      <path d="M3.75,5.25c0-1,.5-1.5,1.5-1.5h7.939c.414,0,.768.146,1.061.439l7.189,7.189c.586.586.879,1.293.879,2.121s-.293,1.536-.879,2.121l-5.818,5.818c-.586.586-1.293.879-2.121.879s-1.536-.293-2.121-.879l-7.189-7.189c-.293-.293-.439-.646-.439-1.061v-7.939ZM9,7.875c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125,1.125.504,1.125,1.125,1.125,1.125-.504,1.125-1.125Z" />
      {children}
    </svg>
  );
});

export default TagFill;
