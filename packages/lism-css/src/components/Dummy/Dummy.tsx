import { Lism, type LismComponentProps } from '../Lism';
import getContent from './getContent';

type DummyProps = Omit<LismComponentProps, 'as'> & {
	pre?: string;
	length?: string;
	lang?: 'ja' | 'en' | 'ar';
	offset?: number;
};

export default function Dummy({ tag = 'p', pre = '', length = 'm', lang = 'en', offset = 0, ...props }: DummyProps) {
	if (tag === 'img') {
		return <Lism as='img' src='https://cdn.lism-css.com/dummy-image.jpg' width={600} height={400} alt='' {...props} />;
	}

	const content = getContent({ tag, pre, lang, length, offset });
	return <Lism tag={tag} {...props} dangerouslySetInnerHTML={{ __html: content }} />;
}
