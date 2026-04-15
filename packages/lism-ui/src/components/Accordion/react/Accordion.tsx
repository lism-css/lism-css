'use client';
import { createContext, useRef, useId, useEffect, useContext } from 'react';
import type { ElementType } from 'react';
import getLismProps from 'lism-css/lib/getLismProps';
import atts from 'lism-css/lib/helper/atts';
import { Lism, Stack, type LismComponentProps } from 'lism-css/react';
import { setEvent } from '../setAccordion';
import AccIcon from './AccIcon';

import '../_style.css';

type AccordionContextType = { accID: string } | null;

// Context: 純粋なReact環境で AccordionItem → Button / Panel へ accID を共有
// Astro 環境では Context が使えないため null がフォールバック
const AccordionContext = createContext<AccordionContextType>(null);

type AccordionRootProps = { allowMultiple?: boolean };

/**
 * 複数の AccordionItem をラップするルート要素
 */
export function AccordionRoot({ children, className, allowMultiple, ...props }: AccordionRootProps & LismComponentProps) {
  return (
    <Stack className={atts(className, 'c--accordion')} data-allow-multiple={allowMultiple ? '' : undefined} {...props}>
      {children}
    </Stack>
  );
}

/**
 * 個別のアコーディオンアイテム（<div> ベース、setEvent で開閉イベントを登録）
 */
export function AccordionItem({ children, className, ...props }: LismComponentProps) {
  const ref = useRef<HTMLDivElement>(null);

  // コンポーネント単位でユニークIDを生成
  const accID = useId();

  // マウント時に開閉イベントを登録（アンマウント時にクリーンアップ）
  useEffect(() => {
    if (!ref.current) return;
    return setEvent(ref.current);
  }, []);

  const lismProps = getLismProps({
    className: atts(className, 'c--accordion_item'),
    ...props,
  });

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
export function Heading<T extends ElementType = 'div'>({ children, className, as, role, ...props }: LismComponentProps<T> & { role?: string }) {
  const isDiv = !as || as === 'div';
  return (
    <Lism
      as={(as ?? 'div') as 'div'}
      className={atts(className, 'c--accordion_heading')}
      set="plain"
      role={isDiv ? (role ?? 'heading') : role}
      {...(props as object)}
    >
      {children}
    </Lism>
  );
}

type ButtonProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  accID?: string;
};

/**
 * 開閉トリガーボタン
 * accID: Context から取得できればそれを優先、なければ props / プレースホルダー
 */
export function Button<T extends ElementType = 'button'>({ children, className, accID: _accID = '__LISM_ACC_ID__', ...props }: ButtonProps<T>) {
  const ctx = useContext(AccordionContext);
  const accID = ctx?.accID || _accID;

  return (
    <Lism
      as="button"
      className={atts(className, 'c--accordion_button')}
      layout="flex"
      set="plain"
      g="10"
      w="100%"
      ai="center"
      jc="between"
      {...(props as object)}
      aria-controls={accID}
      aria-expanded="false"
    >
      {children}
      <AccIcon />
    </Lism>
  );
}

type PanelProps = { accID?: string; isOpen?: boolean };

/**
 * パネル
 */
export function Panel({ children, className, accID: propAccID = '__LISM_ACC_ID__', isOpen = false, ...props }: PanelProps & LismComponentProps) {
  const ctx = useContext(AccordionContext);
  const id = ctx?.accID || propAccID;

  return (
    <Lism
      className={atts(className, 'c--accordion_panel')}
      id={id}
      hidden={isOpen ? undefined : ('until-found' as unknown as boolean)}
      pos="relative"
      ov="hidden"
    >
      <Lism className="c--accordion_content" layout="flow" {...props}>
        {children}
      </Lism>
    </Lism>
  );
}
