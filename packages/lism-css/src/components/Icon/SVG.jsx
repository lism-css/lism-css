export default function SVG({
	size = '1em',
	fill = 'currentColor',
	viewBox = '0 0 24 24',
	path,
	children,
	...props
}) {
	// const iconData = data[name] || {};
	// const { viewBox = '0 0 256 256', path = '' } = iconData;

	// preset or childrenそのまま
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox={viewBox}
			width={size}
			height={size}
			fill={fill}
			focusable='false'
			{...props}
		>
			{path && <path d={path}></path>}
			{children}
		</svg>
	);
}
