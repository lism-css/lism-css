import getLismProps from '../../lib/getLismProps';
import getMediaProps from '../getMediaProps';

// memo: picture対応
export default function Media({ as, exProps, tag, ...props }) {
	const JSX = as || tag || 'img';
	return <JSX {...getLismProps(getMediaProps(props))} {...exProps} />;
}
