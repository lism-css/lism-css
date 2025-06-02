import { Lism } from '../Lism';
import getContent from './getContent';

export default function Dummy({
	tag = 'p',
	pre = '',
	length = 'm',
	lang = 'en',
	offset = 0,
	...props
}) {
	const content = getContent({ tag, pre, lang, length, offset });
	return <Lism tag={tag} {...props} dangerouslySetInnerHTML={{ __html: content }} />;
}
