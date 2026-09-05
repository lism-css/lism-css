import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import '../_style.css';

type ShapeDividerProps<T extends ElementType = 'div'> = LismComponentProps<T> & {
  viewBox?: string;
  isAnimation?: boolean;
  isEmpty?: boolean;
  level?: number | `${number}`;
  stretch?: string;
  offset?: string;
  flip?: string;
};

export function ShapeDivider<T extends ElementType = 'div'>({
  children,
  className,
  viewBox,
  isAnimation,
  isEmpty,
  level,
  stretch,
  offset,
  flip,
  style,
  ...props
}: ShapeDividerProps<T>) {
  if (Number(level) === 0) return null;

  const computedStyle = {
    ...style,
    ...(level != null && { '--level': String(level) }),
    ...(offset != null && { '--inner-offset': offset }),
    ...(stretch != null && { '--inner-stretch': stretch }),
  };

  return (
    <Lism
      className={atts(className, 'b--shapeDivider')}
      max-sz="full"
      aria-hidden="true"
      data-flip={flip || undefined}
      data-has-animation={isAnimation ? 'true' : undefined}
      style={computedStyle}
      {...(props as object)}
    >
      {isEmpty ? null : (
        <div className="b--shapeDivider_inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="b--shapeDivider_svg"
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
