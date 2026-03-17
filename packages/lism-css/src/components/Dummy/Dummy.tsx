import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';
import getContent from './getContent';

type DummyProps<T extends ElementType = 'p'> = LismComponentProps<T> & {
	pre?: string;
	length?: string;
	lang?: 'ja' | 'en' | 'ar';
	offset?: number;
};

export default function Dummy<T extends ElementType = 'p'>({ pre = '', length = 'm', lang = 'en', offset = 0, ...props }: DummyProps<T>) {
	const tagName: ElementType = props.as || 'p';

	if (tagName === 'img') {
		return (
			<Lism as='img' src='https://cdn.lism-css.com/dummy-image.jpg' width={600} height={400} alt='' {...(props as LismComponentProps<'img'>)} />
		);
	}

	const content = getContent({ tag: tagName, pre, lang, length, offset });
	return <Lism {...(props as LismComponentProps)} dangerouslySetInnerHTML={{ __html: content }} />;
}
