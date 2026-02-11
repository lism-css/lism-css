import { Lism, type LismComponentProps } from '../Lism';

export function div(props: LismComponentProps<'div'>) {
	return <Lism tag='div' {...props} />;
}

export function p(props: LismComponentProps<'p'>) {
	return <Lism tag='p' {...props} />;
}

export function span(props: LismComponentProps<'span'>) {
	return <Lism tag='span' {...props} />;
}

export function a(props: LismComponentProps<'a'>) {
	return <Lism tag='a' {...props} />;
}

type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';
type HeadingTag = `h${HeadingLevel}`;
type HeadingProps = LismComponentProps<'h1'> & {
	lv?: HeadingLevel;
};

export function h({ lv = '1', ...props }: HeadingProps) {
	const tag: HeadingTag = `h${lv}`;
	return <Lism tag={tag} {...props} />;
}

export function img(props: LismComponentProps<'img'>) {
	return <Lism tag='img' {...props} />;
}

export function ul(props: LismComponentProps<'ul'>) {
	return <Lism tag='ul' {...props} />;
}

export function ol(props: LismComponentProps<'ol'>) {
	return <Lism tag='ol' {...props} />;
}

export function li(props: LismComponentProps<'li'>) {
	return <Lism tag='li' {...props} />;
}

export function button(props: LismComponentProps<'button'>) {
	return <Lism tag='button' {...props} />;
}
