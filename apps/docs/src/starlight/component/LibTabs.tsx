import React from 'react';
// import { useEffect, useState } from 'react';
import { Tabs, Columns, LinkBox, Frame, Stack, Media, Lism } from 'lism-css/react';
import type { SidebarEntry } from '@/node_modules/@astrojs/starlight/utils/routing/types';

interface ComponentNavData {
	href: string;
	label: string;
	thumb: string;
}

export default function TabsRoot({
	componentList,
	sectionList,
	templateList,
}: {
	componentList: ComponentNavData[];
	sectionList: ComponentNavData[];
	templateList: ComponentNavData[];
}) {
	// memo: クエリパラメータからタブのインデックスを決定
	const [defaultIndex, setDefaultIndex] = React.useState(1);

	React.useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const tab = params.get('tab');
		console.log('params', params, tab);

		if (tab === 'sections') setDefaultIndex(2);
		else if (tab === 'templates') setDefaultIndex(3);
		else setDefaultIndex(1);
	}, []);

	return (
		<Tabs.Root
			variant='emboss'
			g='50'
			defaultIndex={defaultIndex}
			key={defaultIndex} // defaultIndexが変わるたびに再マウント
		>
			<Tabs.Item>
				<Tabs.Tab>Components</Tabs.Tab>
				<Tabs.Panel>
					<h2>Components</h2>
					<Columns cols={[2, 3, 4]}>
						{componentList.map((entry: any) => {
							return (
								<LinkBox layout={Stack} href={entry.href} p='30' g='30' bdc='#D9D9D9'>
									<Frame ar='3/2' bd bdw='1px' bdrs='20' bdc='inherit' bgc='#fff'>
										<Media src={entry.thumb} alt={entry.label} />
									</Frame>
									<Lism class='u--trimHL -ff:mono -fz:s'>{entry.label}</Lism>
								</LinkBox>
							);
						})}
					</Columns>
				</Tabs.Panel>
			</Tabs.Item>
			{/* <Tabs.Item>
				<Tabs.Tab>Sections</Tabs.Tab>
				<Tabs.Panel>
					<h2>Sections</h2>
					<Columns cols={[1, 2]}>
						{sectionList.map((entry: any) => {
							return (
								<LinkBox layout={Stack} href={entry.href} p='30' g='30' bdc='#D9D9D9'>
									<Frame ar='3/2' bd bdw='1px' bdrs='20' bdc='inherit' bgc='#fff'>
										<Media src={entry.thumb} alt={entry.label} />
									</Frame>
									<Lism class='u--trimHL -ff:mono -fz:s'>{entry.label}</Lism>
								</LinkBox>
							);
						})}
					</Columns>
				</Tabs.Panel>
			</Tabs.Item> */}
			<Tabs.Item>
				<Tabs.Tab>Templates</Tabs.Tab>
				<Tabs.Panel>
					<h2>Templates</h2>
					<Columns cols={[1, 2]}>
						{templateList.map((entry: any) => {
							return (
								<LinkBox layout={Stack} href={entry.href} p='30' g='30' bdc='#D9D9D9'>
									<Frame ar='3/2' bd bdw='1px' bdrs='20' bdc='inherit' bgc='#fff'>
										<Media src={entry.thumb} alt={entry.label} />
									</Frame>
									<Lism class='u--trimHL -ff:mono -fz:s'>{entry.label}</Lism>
								</LinkBox>
							);
						})}
					</Columns>
				</Tabs.Panel>
			</Tabs.Item>
		</Tabs.Root>
	);
}
