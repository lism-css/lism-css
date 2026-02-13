import { Lism } from '../Lism';
import getContent from './getContent';

export default function Dummy({ as = 'p', pre = '', length = 'm', lang = 'en', offset = 0, ...props }) {
	if (as === 'img') {
		return <Lism as='img' src='https://cdn.lism-css.com/dummy-image.jpg' width='600' height='400' alt='' {...props} />;
	}

	const content = getContent({ tag: as, pre, lang, length, offset });
	return <Lism as={as} {...props} dangerouslySetInnerHTML={{ __html: content }} />;
}
