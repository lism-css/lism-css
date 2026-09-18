import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

// Omit<…, 'as'> は型が複雑になりすぎて TS2590 になるため、never との交差で as を禁止する
export type TabProps = LismComponentProps<'button'> & {
  as?: never;
  tabId?: string;
  index?: number;
  isActive?: boolean;
};

// tabId / index は Root から渡される。単体利用時のフォールバックとしてプレースホルダーを使う（Accordion の __LISM_ACC_ID__ と同様）
export default function Tab({ tabId = '__LISM_TAB_ID__', index = 0, isActive = false, className, ...props }: TabProps) {
  const controlId = `${tabId}-${index}`;

  // as はスプレッドより後ろに置く（型を通らず as が渡されても button 固定にするため）
  return (
    <Lism
      type="button"
      set="plain"
      className={atts(className, 'b--tabs_tab')}
      id={`${controlId}-tab`}
      role="tab"
      aria-controls={controlId}
      aria-selected={isActive ? 'true' : 'false'}
      tabIndex={isActive ? 0 : -1}
      {...props}
      as="button"
    />
  );
}
