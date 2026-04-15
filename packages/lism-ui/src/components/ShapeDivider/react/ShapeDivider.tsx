import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getProps, { type ShapeDividerProps } from '../getProps';
import '../_style.css';

export default function ShapeDivider({ children, className, ...props }: ShapeDividerProps & LismComponentProps) {
  const componentProps = getProps(props);

  // level が 0 の場合は非表示
  if (!componentProps) return null;

  const { viewBox, isEmpty, ...lismProps } = componentProps;

  return (
    <Lism className={atts(className, 'c--shapeDivider')} {...lismProps}>
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
