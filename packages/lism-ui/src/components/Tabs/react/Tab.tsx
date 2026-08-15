import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

export type TabProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  tabId?: string;
  index?: number;
  isActive?: boolean;
};

// memo: as は props のまま後ろにスプレッドされるので、指定すれば既定の button を上書きできる
// tabId / index は Root から渡される。単体利用時のフォールバックとしてプレースホルダーを使う（Accordion の __LISM_ACC_ID__ と同様）
export default function Tab<T extends ElementType = 'button'>({
  tabId = '__LISM_TAB_ID__',
  index = 0,
  isActive = false,
  className,
  ...props
}: TabProps<T>) {
  const controlId = `${tabId}-${index}`;

  return (
    <Lism
      as="button"
      type="button"
      set="plain"
      className={atts(className, 'b--tabs_tab')}
      id={`${controlId}-tab`}
      role="tab"
      aria-controls={controlId}
      aria-selected={isActive ? 'true' : 'false'}
      tabIndex={isActive ? 0 : -1}
      {...(props as object)}
    />
  );
}
