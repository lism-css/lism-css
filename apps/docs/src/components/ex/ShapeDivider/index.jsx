import { Lism } from 'lism-css/react';
import './style.css';

export default function ShapeDivider({
	viewBox,
	children,
	isAnimation,
	scale,
	level = 5,
	stretch,
	offsetX,
	offsetY,
	css = {},
	style = {},
	...props
}) {
	if (level === 0) return null;

	// scaleをコンポーネントに直書きできるように
	if (null != scale) css.scale = scale;

	// 変数セット
	style['--level'] = level || null;
	style['--offsetX'] = offsetX || null;
	style['--offsetY'] = offsetY || null;
	style['--stretch'] = stretch || null;

	return (
		<Lism isFullwide lismClass='c--shapeDivider' css={css} style={style} {...props}>
			<div className='c--shapeDivider_inner -h:100%'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className={isAnimation ? '-anim:shapeSlide' : ''}
					viewBox={viewBox}
					width='100%'
					height='100%'
					fill='currentColor'
					aria-hidden='true'
					focusable='false'
					preserveAspectRatio='none'
				>
					{children}
				</svg>
			</div>
		</Lism>
	);
}
