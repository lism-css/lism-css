import { Lism, type LismComponentProps } from '../Lism';

type GroupAllowedTag = 'div' | 'section' | 'article' | 'figure' | 'nav' | 'aside' | 'header' | 'footer';

export default function Group({ as = 'div', ...props }: LismComponentProps<'div', GroupAllowedTag>) {
  return <Lism as={as} {...props} />;
}
