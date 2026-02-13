import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';
import getContent from './getContent';

type DummyProps<T extends ElementType = 'div'> = LismComponentProps<T> & {
	pre?: string;
	length?: string;
	lang?: 'ja' | 'en' | 'ar';
	offset?: number;
};

export default function Dummy<T extends ElementType = 'div'>({ pre = '', length = 'm', lang = 'en', offset = 0, ...props }: DummyProps<T>) {
	if (props.as === 'img') {
		return (
			<Lism as='img' src='https://cdn.lism-css.com/dummy-image.jpg' width={600} height={400} alt='' {...(props as LismComponentProps<'img'>)} />
		);
	}

	const content = getContent({ tag: props.as as string, pre, lang, length, offset });
	return <Lism {...(props as LismComponentProps)} dangerouslySetInnerHTML={{ __html: content }} />;
}
