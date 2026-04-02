import atts from '../../../lib/helper/atts';
import type { LismProps } from '../../../lib/getLismProps';
import type { StyleWithCustomProps } from '../../../lib/types';

export interface DecoratorOwnProps {
  size?: string;
  clipPath?: string;
  boxSizing?: string;
}

export type DecoratorProps = LismProps & DecoratorOwnProps;

export default function getDecoratorProps({ lismClass, size, clipPath, boxSizing, style: outerStyle, ...rest }: DecoratorProps): LismProps {
  const style: StyleWithCustomProps = outerStyle ?? {};

  if (clipPath) {
    style.clipPath = clipPath;
  }
  if (boxSizing) {
    style.boxSizing = boxSizing as StyleWithCustomProps['boxSizing'];
  }

  const props: LismProps & Record<string, unknown> = { ...rest };

  if (size) {
    props.ar = '1/1';
    props.w = size;
  }

  props.style = style;

  const defaultProps: LismProps = {
    lismClass: atts(lismClass, `a--decorator`),
    'aria-hidden': 'true',
  };

  return Object.assign(defaultProps, props);
}
