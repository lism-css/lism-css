import { Flex, Lism, Decorator } from 'lism-css/react';

export default function BalloonBox({ variant = 'left', bdw = '1px', bdc, bgc, keycolor, bdrs = '20', children, ...props }) {
	const colorProps = { bdc, bgc };
	if (keycolor) {
		colorProps.lismClass += ' u--cbox';
		colorProps.keycolor = keycolor;
	} else {
		colorProps.bgc = bgc || 'base';
		colorProps.bdc = bdc || 'currentColor';
	}

	let parentProps = {};
	let decoProps = {};
	// let wrapProps = {};
	switch (variant) {
		case 'left':
			parentProps = { jc: 's', pl: '1em' };
			decoProps = {
				t: '50%',
				l: '0',
				rotate: '45deg',
				trnslt: '-50% -50%',
				clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%)',
			};
			break;
		case 'right':
			parentProps = { jc: 'e', pr: '1em' };
			decoProps = {
				t: '50%',
				l: '100%',
				rotate: '-45deg',
				trnslt: '-50% -50%',
				clipPath: 'polygon(0% 100%, 100% 0%, 100% 100%)',
			};
			break;
		case 'top':
			parentProps = { jc: 'c', pt: '1em' };
			decoProps = {
				t: '0',
				l: '50%',
				rotate: '45deg',
				trnslt: '-50% -50%',
				clipPath: 'polygon(0% 0%, 0% 100%, 100% 0%)',
			};
			break;
		case 'bottom':
			parentProps = { jc: 'c', pb: '1em' };
			decoProps = {
				t: '100%',
				l: '50%',
				rotate: '45deg',
				trnslt: '-50% -50%',
				clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
			};
			break;
		default:
			break;
	}

	return (
		<Flex lismClass='c--balloonBox' variant={variant} {...parentProps} {...props}>
			<Lism pos='r' bd p='30' w='fit-content' bdw={bdw} bdrs={bdrs} {...colorProps}>
				{children}
				<Decorator className='-bxsz:cb' pos='a' size='0.875em' bd='inherit' bgc='inherit' {...decoProps} />
			</Lism>
		</Flex>
	);
}
