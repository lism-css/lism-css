import atts from '../../../lib/helper/atts';
import getFilterProps from '../../getFilterProps';
import type { LismComponentProps } from '../../Lism/Lism';
import type { LismProps } from '../../../lib/getLismProps';
import type { CSSProperties } from 'react';

type MediaOwnProps = {
	objectPosition?: CSSProperties['objectPosition'];
	objectFit?: CSSProperties['objectFit'];
};

export type MediaProps = LismComponentProps<'img'> & MediaOwnProps;

export default function getMediaProps({ objectPosition, objectFit, lismClass, style = {}, ...rest }: MediaProps): LismComponentProps {
	if (objectPosition) style.objectPosition = objectPosition;
	if (objectFit) style.objectFit = objectFit;

	// Omit<MediaProps, ...> のスプレッド結果は TypeScript が LismProps と推論できないためキャスト
	return getFilterProps({ ...rest, lismClass: atts(lismClass, `a--media`), style } as LismProps);
}
