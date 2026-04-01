import atts from '../../../lib/helper/atts';
import type { LismProps } from '../../../lib/getLismProps';

export function getDividerProps({ lismClass, ...props }: LismProps): LismProps {
  return {
    lismClass: atts(lismClass, 'a--divider'),
    'aria-hidden': 'true',
    ...props,
  };
}
