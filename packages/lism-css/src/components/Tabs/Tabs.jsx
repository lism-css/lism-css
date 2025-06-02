import React from 'react';
import { Grid } from '../Grid';
import Tab from './Tab';
import TabItem from './TabItem';
import TabList from './TabList';
import TabPanel from './TabPanel';
import getTabsProps from './getProps';
// import { TabContext } from './context';

export default function Tabs({ tabId = '', defaultIndex = 1, listProps = {}, children, ...props }) {
	const [activeIndex, setActiveIndex] = React.useState(defaultIndex);
	const theTabId = tabId || React.useId();
	const btns = [];
	const panels = [];

	// Tabs.Item の処理
	React.Children.forEach(children, (child, index) => {
		const tabIndex = index + 1; // 1 はじまり
		// console.log('child.type', React.isValidElement(child), child.type);

		if (React.isValidElement(child) && child.type === TabItem) {
			React.Children.forEach(child.props.children, (nestedChild) => {
				if (React.isValidElement(nestedChild)) {
					if (nestedChild.type === Tab) {
						const tabProps = nestedChild.props;
						btns.push(
							<Tab
								{...tabProps}
								tabId={theTabId}
								index={tabIndex}
								isActive={tabIndex === activeIndex}
								onClick={() => setActiveIndex(tabIndex)}
							/>
						);
					} else if (nestedChild.type === TabPanel) {
						const panelProps = nestedChild.props;
						panels.push(
							<TabPanel
								{...panelProps}
								tabId={theTabId}
								index={tabIndex}
								isActive={tabIndex === activeIndex}
							/>
						);
					}
				}
			});
		}
	});

	return (
		<Grid {...getTabsProps(props)}>
			{btns.length === 0 ? (
				// TabItemを使わず直接TabListなどを子要素に配置する場合
				children
			) : (
				<>
					<TabList {...listProps}>{btns}</TabList>
					{panels}
				</>
			)}
		</Grid>
	);
}
