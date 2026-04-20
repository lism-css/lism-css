'use client';
import { useContext } from 'react';
import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, Flow, type LayoutComponentProps } from 'lism-css/react';
import type { FlowLayoutProps } from 'lism-css/lib/types/LayoutProps';
import { AccordionContext } from './context';

type PanelProps<T extends ElementType = 'div'> = LayoutComponentProps<T, FlowLayoutProps> & {
  accID?: string;
  isOpen?: boolean;
};

/**
 * パネル
 */
export default function Panel<T extends ElementType = 'div'>({
  children,
  className,
  accID: propAccID = '__LISM_ACC_ID__',
  isOpen = false,
  ...props
}: PanelProps<T>) {
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
      <Flow className="c--accordion_content" {...(props as object)}>
        {children}
      </Flow>
    </Lism>
  );
}
