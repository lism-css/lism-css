import React from 'react';
import getLismProps from 'lism-css/lib/getLismProps';
import { Lism, Stack } from 'lism-css/react';
import { getRootProps, getItemProps, getHeadingProps, defaultProps } from '../getProps';
import { setEvent } from '../setAccordion';
import AccIcon from './AccIcon';

import '../_style.css';

// Context: 純粋なReact環境で AccordionItem → Button / Panel へ accID を共有
// Astro 環境では Context が使えないため null がフォールバック
const AccordionContext = React.createContext(null);

/**
 * 複数の AccordionItem をラップするルート要素
 */
export function AccordionRoot({ children, ...props }) {
	const rootProps = getLismProps(getRootProps(props));
	return <Stack {...rootProps}>{children}</Stack>;
}

/**
 * 個別のアコーディオンアイテム（<div> ベース、setEvent で開閉イベントを登録）
 */
export function AccordionItem({ children, ...props }) {
	const ref = React.useRef(null);

	// コンポーネント単位でユニークIDを生成
	const accID = React.useId();

	// マウント時に開閉イベントを登録（アンマウント時にクリーンアップ）
	React.useEffect(() => {
		if (!ref.current) return;
		return setEvent(ref.current);
	}, []);

	const lismProps = getLismProps(getItemProps(props));

	return (
		<AccordionContext.Provider value={{ accID }}>
			<div ref={ref} {...lismProps}>
				{children}
			</div>
		</AccordionContext.Provider>
	);
}

/**
 * 見出しエリアのラッパー（デフォルトは <div role="heading">）
 * tag に h2〜h6 を指定すると role は付与されない
 */
export function Heading({ children, ...props }) {
	return <Lism {...getHeadingProps(props)}>{children}</Lism>;
}

/**
 * 開閉トリガーボタン（末尾に AccIcon を自動配置）
 * accID: Context から取得できればそれを優先、なければ props / プレースホルダー
 */
export function Button({ children, accID: _accID = '__LISM_ACC_ID__', ...props }) {
	const ctx = React.useContext(AccordionContext);
	const accID = ctx?.accID || _accID;

	return (
		<Lism {...defaultProps.button} {...props} aria-controls={accID} aria-expanded='false'>
			{children}
			<AccIcon />
		</Lism>
	);
}

/**
 * 開閉パネル（hidden="until-found" でブラウザ検索対応）
 * flow: 内部コンテンツ（__content）に渡すフローレイアウト設定
 * accID: Context から取得できればそれを優先、なければ props / プレースホルダー
 */
export function Panel({ children, flow = undefined, accID: _accID = '__LISM_ACC_ID__', ...props }) {
	const ctx = React.useContext(AccordionContext);
	const accID = ctx?.accID || _accID;

	return (
		<Lism {...defaultProps.panel} id={accID} hidden='until-found'>
			<Lism layout='flow' flow={flow} {...defaultProps.content} {...props}>
				{children}
			</Lism>
		</Lism>
	);
}
