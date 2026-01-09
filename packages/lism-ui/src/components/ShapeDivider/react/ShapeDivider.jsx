import { Lism } from 'lism-css/react';
import getProps from '../getProps';
import '../_style.css';

export default function ShapeDivider({ children, ...props }) {
	const componentProps = getProps(props);

	// level が 0 の場合は非表示
	if (!componentProps) return null;

	const { viewBox, isAnimation, isEmpty, ...lismProps } = componentProps;

	return (
		<Lism {...lismProps}>
			{isEmpty ? null : (
				<div className='c--shapeDivider_inner'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className={isAnimation ? '-anim:shapeSlide' : ''}
						viewBox={viewBox}
						width='100%'
						height='100%'
						fill='currentColor'
						focusable='false'
						preserveAspectRatio='none'
					>
						{children}
					</svg>
				</div>
			)}
		</Lism>
	);
}
