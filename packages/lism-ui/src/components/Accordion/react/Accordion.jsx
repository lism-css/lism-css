import React from 'react';
import getLismProps from 'lism-css/lib/getLismProps';
import { Lism } from 'lism-css/react';
import { getAccProps, getHeadingProps, defaultProps } from '../getProps';
import { setEvent } from '../setAccordion';
import AccIcon from './AccIcon';

import '../_style.css';

// Context: AccordionRoot から Button / Panel へ accID を共有
const AccordionContext = React.createContext({ accID: '' });

/**
 * ルート要素（<div> ベース、setEvent で開閉イベントを登録）
 */
export function AccordionRoot({ children, ...props }) {
	const ref = React.useRef(null);

	// コンポーネント単位でユニークIDを生成
	const accID = React.useId();

	// マウント時に開閉イベントを登録（アンマウント時にクリーンアップ）
	React.useEffect(() => {
		if (!ref.current) return;
		return setEvent(ref.current);
	}, []);

	const lismProps = getLismProps(getAccProps(props));

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
 * aria-controls / aria-expanded は Context 経由の accID で自動設定
 */
export function Button({ children, ...props }) {
	const { accID } = React.useContext(AccordionContext);

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
 */
export function Panel({ children, flow, ...props }) {
	const { accID } = React.useContext(AccordionContext);

	return (
		<Lism {...defaultProps.panel} id={accID} hidden='until-found'>
			<Lism layout='flow' flow={flow} {...defaultProps.content} {...props}>
				{children}
			</Lism>
		</Lism>
	);
}
