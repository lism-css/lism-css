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

export default function LibTabs({
	componentList,
	templateList,
	layoutList,
}: {
	componentList: NavLinkData[];
	templateList: NavLinkData[];
	layoutList: NavLinkData[];
}) {
	// memo: クエリパラメータからタブのインデックスを決定
	const [defaultIndex, setDefaultIndex] = React.useState(1);

	React.useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const tab = params.get('tab');
		// console.log('params', params, tab);

		if (tab === 'templates') {
			setDefaultIndex(2);
		} else {
			setDefaultIndex(1);
		}
	}, []);

	return (
		<Tabs.Root
			variant='emboss'
			g='40'
			defaultIndex={defaultIndex}
			key={defaultIndex} // defaultIndexが変わるたびに再マウント
		>
			<Tabs.Item>
				<Tabs.Tab>Components</Tabs.Tab>
				<Tabs.Panel>
					<h2>Components</h2>
					<Columns cols={[2, 3, 4]} style={{ 'content-visibility': 'auto' }}>
						<UIBlockList entries={componentList} />
					</Columns>
				</Tabs.Panel>
			</Tabs.Item>
			<Tabs.Item>
				<Tabs.Tab>Templates</Tabs.Tab>
				<Tabs.Panel>
					<h2>Templates</h2>
					<Columns cols={[1, 2]} style={{ 'content-visibility': 'auto' }}>
						<UIBlockList entries={templateList} />
					</Columns>
				</Tabs.Panel>
			</Tabs.Item>
			<Tabs.Item>
				<Tabs.Tab>Page Layout</Tabs.Tab>
				<Tabs.Panel>
					<h2>Page Layout</h2>
					<Columns cols={[1, 2]} style={{ 'content-visibility': 'auto' }}>
						<UIBlockList entries={layoutList} />
					</Columns>
				</Tabs.Panel>
			</Tabs.Item>
		</Tabs.Root>
	);
}

function UIBlockList({ entries }: { entries: NavLinkData[] }) {
	return (
		<>
			{entries.map((entry, index) => {
				if (entry.type === 'group') {
					return (
						<React.Fragment key={index}>
							<Lism tag='h3' class='u-trim -fz:l -gc:1/-1' py='20' my-s='20'>
								{entry.label}
							</Lism>
							<UIBlockList entries={entry.entries || []} />
						</React.Fragment>
					);
				}
				return (
					<LinkBox key={index} layout='stack' href={entry.href} p='20' g='20'>
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
