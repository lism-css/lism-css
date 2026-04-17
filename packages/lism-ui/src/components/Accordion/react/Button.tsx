'use client';
import { useContext } from 'react';
import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Flex, type LayoutComponentProps } from 'lism-css/react';
import type { FlexProps } from 'lism-css/lib/types/LayoutProps';
import { AccordionContext } from './context';
import Icon from './Icon';

type ButtonProps<T extends ElementType = 'button'> = LayoutComponentProps<T, FlexProps> & {
  accID?: string;
  isOpen?: boolean;
};

/**
 * 開閉トリガーボタン
 * accID: Context から取得できればそれを優先、なければ props / プレースホルダー
 */
export default function Button<T extends ElementType = 'button'>({
  children,
  className,
  accID: _accID = '__LISM_ACC_ID__',
  isOpen = false,
  ...props
}: ButtonProps<T>) {
  const ctx = useContext(AccordionContext);
  const accID = ctx?.accID || _accID;

  return (
    <Flex
      as="button"
      className={atts(className, 'c--accordion_button')}
      set="plain"
      g="10"
      w="100%"
      ai="center"
      jc="between"
      aria-controls={accID}
      aria-expanded={isOpen ? 'true' : 'false'}
      {...(props as object)}
    >
      {children}
      <Icon />
    </Flex>
  );
}
