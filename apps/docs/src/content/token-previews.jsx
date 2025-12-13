import { Box, HTML, Stack, Center, Dummy } from 'lism-css/react';

export const FzDemos = ({ lang = 'ja' }) => (
	<Stack g='20' ar='16/9' ov-y='auto' ov-x='clip' p='15'>
		{['2xs', 'xs', 's', 'base', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'].map((fz, i) => {
			return (
				<Stack key={fz} g='5'>
					<HTML.span className='is--sizeTip u-trim' fz='12px' lh='s'>
						<code>{fz}</code>
					</HTML.span>
					<Dummy lang={lang} length='s' fz={fz} className='-whitespace:nowrap -lh:1' />
				</Stack>
			);
		})}
	</Stack>
);

export const BoxShadowDemos = ({ shadows = [] }) => {
	return (
		<>
			{shadows.map((name) => {
				return (
					<Center key={name} h='100%' ar='1/1' bgc='base' bxsh={name} bdrs='10' ff='mono' fz='xs' c='text-2'>
						{name}
					</Center>
				);
			})}
		</>
	);
};

export const SpacingDemos = ({ spaces, isValueLabel }) => {
	return (
		<>
			{spaces.map((s, i) => {
				const label = isValueLabel ? <code>{s}</code> : <code>{i}</code>;
				return (
					<Stack key={s} g='5'>
						{!isValueLabel && (
							<Box bd-l bdw='2px' lh='1' pl='10' fz='2xs'>
								{s}
							</Box>
						)}
						<Box pl={s} bgc='main'>
							<Box bgc='base' pl='10' fz='xs'>
								{label}
							</Box>
						</Box>
					</Stack>
				);
			})}
		</>
	);
};
