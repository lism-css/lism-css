import atts from '../../../lib/helper/atts';
import getFilterProps from '../../getFilterProps';
import type { LismProps } from '../../../lib/getLismProps';
import type { CSSProperties } from 'react';

export interface MediaOwnProps {
  // StyleWithCustomProp が、CSSPropertiesに依存しているため。
  objectPosition?: CSSProperties['objectPosition'];
  objectFit?: CSSProperties['objectFit'];
}

export interface MediaProps extends LismProps, MediaOwnProps {}

export default function getMediaProps({ objectPosition, objectFit, lismClass, style = {}, ...rest }: MediaProps): LismProps {
  if (objectPosition) style.objectPosition = objectPosition;
  if (objectFit) style.objectFit = objectFit;

  return getFilterProps({ ...rest, lismClass: atts(lismClass, `a--media`), style });
}
