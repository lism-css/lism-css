import { Lism } from '../Lism';
import getContent from './getContent';

export default function Dummy({ tag = 'p', pre = '', length = 'm', lang = 'en', offset = 0, ...props }) {
	if (tag === 'img') {
		return <Lism tag='img' src='https://placehold.co/300x200?text=placeholder' width='300' height='200' alt='' {...props} />;
	}

	const content = getContent({ tag, pre, lang, length, offset });
	return <Lism tag={tag} {...props} dangerouslySetInnerHTML={{ __html: content }} />;
}
