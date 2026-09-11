// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type NoteProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Note = /* @__PURE__ */ forwardRef<SVGSVGElement, NoteProps>(function Note(
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
      <polygon points="12 15 9 15 9 12 18 3 21 6 12 15" />
      <line x1="15.75" y1="5.25" x2="18.75" y2="8.25" />
      <path d="M20.25,12v7.5c0,.414-.336.75-.75.75H4.5c-.414,0-.75-.336-.75-.75V4.5c0-.414.336-.75.75-.75h7.5" />
      {children}
    </svg>
  );
});

export default Note;
