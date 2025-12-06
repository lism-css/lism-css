import { Lism } from '../Lism';

export function div(props) {
	return <Lism tag='div' {...props} />;
}
export function p(props) {
	return <Lism tag='p' {...props} />;
}
export function span(props) {
	return <Lism tag='span' {...props} />;
}
export function a(props) {
	return <Lism tag='a' {...props} />;
}
export function h({ lv = '1', ...props }) {
	return <Lism tag={`h${lv}`} {...props} />;
}
export function img(props) {
	return <Lism tag='img' {...props} />;
}
export function ul(props) {
	return <Lism tag='ul' {...props} />;
}
export function ol(props) {
	return <Lism tag='ol' {...props} />;
}
export function li(props) {
	return <Lism tag='li' {...props} />;
}
export function button(props) {
	return <Lism tag='button' setPlain {...props} />;
}
