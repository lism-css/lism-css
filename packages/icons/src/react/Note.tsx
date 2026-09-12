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
      <path d="M11.25,3h-6c-1.243,0-2.25,1.007-2.25,2.25v13.5c0,1.243,1.007,2.25,2.25,2.25h13.5c1.243,0,2.25-1.007,2.25-2.25v-6" />
      <path d="M9.353,15.529c-.246.049-.5-.028-.677-.205s-.254-.432-.205-.677l.485-2.424c.029-.145.1-.279.205-.383L17.47,3.53c.141-.141.331-.22.53-.22s.39.079.53.22l1.939,1.939c.293.293.293.768,0,1.061l-8.309,8.309c-.105.105-.238.176-.383.205l-2.424.485Z" />
      <path d="M15.75,5.25l3,3" />
      {children}
    </svg>
  );
});

export default Note;
