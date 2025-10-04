import { Flex, Divider } from 'lism-css/react';

export default function DividerLabel({ children, textPosition, bd = 'bs', bdc = 'currentColor', bdw, bds, ...props }) {
	const bdProps = { bd, bdc, bdw, bds };

	return (
		<Flex lismClass='c--dividerLabel' ai='c' g='30' lh='1' {...props}>
			{textPosition !== 'start' && <Divider o='soft' fx='1' {...bdProps} />}
			<div className='c--dividerLabel_text'>{children}</div>
			{textPosition !== 'end' && <Divider o='soft' fx='1' {...bdProps} />}
		</Flex>
	);
}
