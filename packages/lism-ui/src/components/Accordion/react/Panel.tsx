'use client';
import { useContext } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, Flow, type LayoutComponentProps } from 'lism-css/react';
import type { FlowLayoutProps } from 'lism-css/lib/types/LayoutProps';
import { AccordionContext } from './context';

type PanelProps = LayoutComponentProps<'div', FlowLayoutProps> & {
  accID?: string;
  isOpen?: boolean;
};

/**
 * パネル
 */
export default function Panel({ children, className, accID: propAccID = '__LISM_ACC_ID__', isOpen = false, ...props }: PanelProps) {
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
      <Flow className="c--accordion_content" {...props}>
        {children}
      </Flow>
    </Lism>
  );
}
