import { Stack, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

export default function Nest({ children, className, ...props }: LismComponentProps) {
  return (
    <Stack as="ul" className={atts(className, 'c--navMenu_nest')} px-s="20" {...props}>
      {children}
    </Stack>
  );
}
