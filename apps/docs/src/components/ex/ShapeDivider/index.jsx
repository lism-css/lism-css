import { Lism } from 'lism-css/react';
import './style.css';

export default function ShapeDivider({ viewBox, children, isAnimation, isEmpty, level = 5, stretch, offset, flip, style = {}, ...props }) {
	if (level === 0) return null;

	// 変数セット
	style['--level'] = level || null;
	style['--_inner-offset'] = offset || null;
	style['--_inner-stretch'] = stretch || null;

	return (
		<Lism lismClass='c--shapeDivider' max-sz='full' data-flip={flip} aria-hidden='true' style={style} {...props}>
			<div className='c--shapeDivider_inner -h:100%'>
				{isEmpty ? null : (
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
				)}
			</div>
		</Lism>
	);
}
