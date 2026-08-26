import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type TabPanelProps<T extends ElementType = 'div'> = LismComponentProps<T> & {
  tabId?: string;
  isActive?: boolean;
  index?: number;
};

// tabId / index は Root から渡される。単体利用時のフォールバックとしてプレースホルダーを使う（Accordion の __LISM_ACC_ID__ と同様）
export default function TabPanel<T extends ElementType = 'div'>({
  tabId = '__LISM_TAB_ID__',
  isActive = false,
  index = 0,
  className,
  ...props
}: TabPanelProps<T>) {
  const controlId = `${tabId}-${index}`;

  return (
    <Lism
      id={controlId}
      role="tabpanel"
      aria-labelledby={`${controlId}-tab`}
      tabIndex={0}
      hidden={!isActive}
      className={atts(className, 'b--tabs_panel')}
      {...(props as object)}
    />
  );
}
