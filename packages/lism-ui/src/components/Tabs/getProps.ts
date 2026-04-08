import atts from 'lism-css/lib/helper/atts';

type TabsProps = {
  lismClass?: string;
  [key: string]: unknown;
};

export default function getTabsProps({ lismClass, ...props }: TabsProps): Record<string, unknown> {
  return {
    lismClass: atts(lismClass, 'c--tabs'),
    ...props,
  };
}
