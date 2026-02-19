import atts from '../../../lib/helper/atts';
import type { LismComponentProps } from '../../Lism/Lism';

export function getDividerProps({ lismClass, ...props }: LismComponentProps): LismComponentProps {
	return {
		lismClass: atts(lismClass, 'a--divider'),
		'aria-hidden': 'true',
		...props,
	};
}
