import type { ReactNode } from 'react';

type TabItemProps = {
  isTabItem?: boolean;
  children?: ReactNode;
};

// Note: <Tabs>側でループして色々処理される。
// 引数でちゃんと処理したいpropを書いておかないとだめ。
export default function TabItem({ isTabItem = true, children }: TabItemProps) {
  void isTabItem;
  return <div>{children}</div>;
}
