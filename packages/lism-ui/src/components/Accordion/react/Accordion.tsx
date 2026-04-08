'use client';
import { createContext, useRef, useId, useEffect, useContext } from 'react';
import getLismProps from 'lism-css/lib/getLismProps';
import { Lism, Stack, type LismComponentProps } from 'lism-css/react';
import {
  getRootProps,
  getItemProps,
  getHeadingProps,
  getPanelProps,
  defaultProps,
  type AccordionRootProps,
  type AccordionItemProps,
  type AccordionHeadingProps,
  type AccordionPanelProps,
} from '../getProps';
import { setEvent } from '../setAccordion';
import AccIcon from './AccIcon';

import '../_style.css';

type AccordionContextType = { accID: string } | null;

// Context: 純粋なReact環境で AccordionItem → Button / Panel へ accID を共有
// Astro 環境では Context が使えないため null がフォールバック
const AccordionContext = createContext<AccordionContextType>(null);

/**
 * 複数の AccordionItem をラップするルート要素
 */
export function AccordionRoot({ children, ...props }: AccordionRootProps & LismComponentProps) {
  const rootProps = getRootProps(props);
  return <Stack {...rootProps}>{children}</Stack>;
}

/**
 * 個別のアコーディオンアイテム（<div> ベース、setEvent で開閉イベントを登録）
 */
export function AccordionItem({ children, ...props }: AccordionItemProps & LismComponentProps) {
  const ref = useRef<HTMLDivElement>(null);

  // コンポーネント単位でユニークIDを生成
  const accID = useId();

  // マウント時に開閉イベントを登録（アンマウント時にクリーンアップ）
  useEffect(() => {
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
 * as に h2〜h6 を指定すると role は付与されない
 */
export function Heading({ children, ...props }: AccordionHeadingProps & LismComponentProps) {
  return <Lism {...getHeadingProps(props)}>{children}</Lism>;
}

type ButtonProps = LismComponentProps & {
  accID?: string;
};

/**
 * 開閉トリガーボタン
 * accID: Context から取得できればそれを優先、なければ props / プレースホルダー
 */
export function Button({ children, accID: _accID = '__LISM_ACC_ID__', ...props }: ButtonProps) {
  const ctx = useContext(AccordionContext);
  const accID = ctx?.accID || _accID;

  return (
    <Lism {...(defaultProps.button as unknown as LismComponentProps)} {...props} aria-controls={accID} aria-expanded="false">
      {children}
      <AccIcon />
    </Lism>
  );
}

/**
 * パネル
 */
export function Panel({ children, ...props }: AccordionPanelProps & LismComponentProps) {
  const ctx = useContext(AccordionContext);
  const { panelProps, contentProps } = getPanelProps({ _contextID: ctx?.accID, ...props });

  return (
    <Lism {...panelProps}>
      <Lism {...contentProps}>{children}</Lism>
    </Lism>
  );
}
