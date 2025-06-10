import { Center, Grid, GridItem, Icon, Decorator } from 'lism-css/react';
import './style.scss';

export function Root({ children, ...props }) {
	return (
		<Grid lismClass='c--timeline' lh='s' {...props}>
			{children}
		</Grid>
	);
}

export function Line(props) {
	return <GridItem layout={Decorator} lismClass='c--timeline__line' bgc='divider' jslf='c' {...props} />;
}
export function Shape(props) {
	return (
		<GridItem
			lismClass='c--timeline__shape'
			layout={Center}
			pos='r'
			z='1'
			w='1em'
			h='1em'
			c='base'
			// bgc={shapeColor || 'text'}
			bdrs='99'
			jslf='c'
			{...props}
		/>
	);
}

export function Item({ isHorizontal, isStart, isEnd, isHighlighted, icon, iconProps = {}, shapeColor, children, ...props }) {
	let dataTimeline = null;
	let lineProps = {
		gr: isHorizontal ? '1' : '1 / -1',
		gc: isHorizontal ? '1 / -1' : '1',
	};
	let shapeProps = {
		gr: isHorizontal ? '1' : '2',
		gc: isHorizontal ? '2' : '1',
	};

	if (isStart) {
		dataTimeline = 'start';
		lineProps[`${isHorizontal ? 'jslf' : 'aslf'}`] = 'e';
	}
	if (isEnd) {
		dataTimeline = 'end';
		lineProps = Object.assign(lineProps, isHorizontal ? { jslf: 's' } : { gr: '1 / 3', aslf: 's' });
	}
	if (!icon) {
		shapeProps.fz = '2xs';
	}

	return (
		<Grid
			lismClass='c--timeline__item'
			data-timeline={dataTimeline}
			ai='c'
			ji={isHorizontal ? 'c' : null}
			colg={isHorizontal ? null : '20'}
			rowg={isHorizontal ? '10' : null}
			{...props}
		>
			<Line {...lineProps} />
			<Shape bgc={shapeColor || 'text'} {...shapeProps}>
				{isHighlighted && <Decorator className='c--timeline__highlight' tag='span' pos='a' z='-1' bgc='inherit' bdrs='99' op='low' />}
				{icon && <Icon icon={icon} scale='0.75' fz='s' {...iconProps} />}
			</Shape>
			{children}
		</Grid>
	);
}

export function Time(props) {
	return <GridItem className='c--timeline__time' fz='xs' c='text-2' gr='2' gc='2' {...props} />;
}
export function Title(props) {
	return <GridItem className='c--timeline__title' fw='bold' gr='3' gc='2' {...props} />;
}
export function Text(props) {
	return <GridItem className='c--timeline__text' fz='s' mbs='10' gr='4' gc='2' {...props} />;
}
