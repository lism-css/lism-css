import { Media, Frame } from 'lism-css/react';

export default function Avatar({ size = '2em', src = '', alt = '', ...props }) {
	return (
		<Frame lismClass='c--avatar' ar='1/1' w={size} bdrs='99' {...props}>
			<Media src={src} alt={alt} width='100%' height='100%' decoding='async' />
		</Frame>
	);
}
