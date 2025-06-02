import { Center, Stack, Grid, GridItem, Icon, Decorator } from 'lism-css/react';

export function Timeline({ children, ...props }) {
	return (
		<Stack className='c--timeline' {...props}>
			{children}
		</Stack>
	);
}

export function Item({ icon, isStart, isEnd, isHighlighted, shapeColor, children, ...props }) {
	let itemClass = 'c--timeline__item';
	let dataTimeline = null;
	const lineProps = {};
	const shapeProps = {
		pos: 'r',
		z: '1',
		jslf: 'c',
		bdrs: '99',
		c: 'base',
		bgc: shapeColor || 'text',
		ga: 'shape',
	};

	if (isStart) {
		dataTimeline = 'start';
		lineProps.aslf = 'e';
	}
	if (isEnd) {
		dataTimeline = 'end';
		lineProps.aslf = 's';
	}
	if (icon) {
		shapeProps.layout = Center;
	}

	return (
		<Grid className={itemClass} data-timeline={dataTimeline} ai='c' colg='20' {...props}>
			<GridItem
				layout={Decorator}
				className='c--timeline__line'
				w='2px'
				bgc='divider'
				jslf='c'
				gc='1'
				gr='1 / -1'
				{...lineProps}
			/>
			<GridItem className='c--timeline__shape' {...shapeProps}>
				{isHighlighted && (
					<Decorator
						className='c--timeline__highlight'
						tag='span'
						pos='a'
						z='-1'
						i='-3px'
						bgc='inherit'
						bdrs='99'
						op='low'
					/>
				)}
				{icon && <Icon icon={icon} scale='0.75' fz='s' />}
			</GridItem>
			{children}
		</Grid>
	);
}

export function Time(props) {
	return (
		<GridItem className='c--timeline__time' ga='time' fz='xs' lh='xs' c='text-2' {...props} />
	);
}

export function Title(props) {
	return (
		<GridItem className='c--timeline__title' ga='time' fz='xs' lh='xs' c='text-2' {...props} />
	);
}
export function Body(props) {
	return <GridItem className='c--timeline__body' ga='body' mbs='10' {...props} />;
}
