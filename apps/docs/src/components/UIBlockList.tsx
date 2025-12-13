import React from 'react';
// import { useEffect, useState } from 'react';
import { Tabs, Columns, LinkBox, Frame, Stack, Media, Lism } from 'lism-css/react';
// import type { SidebarEntry } from '@/node_modules/@astrojs/starlight/utils/routing/types';

export interface NavLinkData {
	type: 'link' | 'group';
	href?: string;
	label?: string;
	thumb?: string;
	iframePath?: string;
	entries?: NavLinkData[];
}

export default function UIBlockList({ entries }: { entries: NavLinkData[] }) {
	return (
		<>
			{entries.map((entry, index) => {
				if (entry.type === 'group') {
					return (
						<React.Fragment key={index}>
							<Lism tag='h2' class='u-trim -fz:2xl -gc:1/-1' py='20' my-s='20'>
								{entry.label}
							</Lism>
							<UIBlockList entries={entry.entries || []} />
						</React.Fragment>
					);
				}
				return (
					<LinkBox key={index} layout='stack' href={entry.href} p='20' g='20' bdc='#D9D9D9'>
						<Frame ar='3/2' bd bdw='1px' bdrs='20' bdc='inherit' bgc='#fff' isContainer>
							{entry.thumb && <Media src={entry.thumb} alt={entry.label} />}
							{entry.iframePath && (
								<Frame className='u--scalePreview' ar='3/2' data-scale-preview-type='list'>
									<iframe src={entry.iframePath} width='800' height='600' loading='lazy' />
								</Frame>
							)}
						</Frame>
						<Lism class='u-trim -ff:mono -fz:s'>{entry.label}</Lism>
					</LinkBox>
				);
			})}
		</>
	);
}
