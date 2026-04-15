import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import '../_style.css';

type ShapeDividerProps = LismComponentProps & {
  viewBox?: string;
  isAnimation?: boolean;
  isEmpty?: boolean;
  level?: number;
  stretch?: string;
  offset?: string;
  flip?: string;
  [key: string]: unknown;
};

export default function ShapeDivider({
  children,
  className,
  viewBox,
  isAnimation,
  isEmpty,
  level = 5,
  stretch,
  offset,
  flip,
  style,
  ...props
}: ShapeDividerProps) {
  if (level === 0) return null;

  const computedStyle = {
    ...style,
    '--level': String(level),
    ...(offset != null && { '--_inner-offset': offset }),
    ...(stretch != null && { '--_inner-stretch': stretch }),
  };

  return (
    <Lism
      className={atts(className, 'c--shapeDivider')}
      max-sz="full"
      aria-hidden="true"
      data-flip={flip || undefined}
      data-has-animation={isAnimation ? 'true' : undefined}
      style={computedStyle}
      {...props}
    >
      {isEmpty ? null : (
        <div className="c--shapeDivider_inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="c--shapeDivider_svg"
            viewBox={viewBox}
            width="100%"
            height="100%"
            fill="currentColor"
            focusable="false"
            preserveAspectRatio="none"
          >
            {children}
          </svg>
        </div>
      )}
    </Lism>
  );
}
