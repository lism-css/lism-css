import { Lism, type LismComponentProps } from 'lism-css/react';

export default function TabList(props: LismComponentProps) {
  return <Lism lismClass="c--tabs_list" role="tablist" {...props} />;
}
