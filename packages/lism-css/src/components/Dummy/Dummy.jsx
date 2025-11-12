import { Lism } from '../Lism';
import getContent from './getContent';

export default function Dummy({ tag = 'p', pre = '', length = 'm', lang = 'en', offset = 0, ...props }) {
	if (tag === 'img') {
		return <Lism tag='img' src='https://cdn.lism-css.com/dummy-image.jpg' width='600' height='400' alt='' {...props} />;
	}

	const content = getContent({ tag, pre, lang, length, offset });
	return <Lism tag={tag} {...props} dangerouslySetInnerHTML={{ __html: content }} />;
}
