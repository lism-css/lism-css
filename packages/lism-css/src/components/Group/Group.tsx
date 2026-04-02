import { Lism, type LismComponentProps } from '../Lism';

type GroupAllowedTag = 'div' | 'section' | 'article' | 'figure' | 'nav' | 'aside' | 'header' | 'footer';

export default function Group<T extends GroupAllowedTag = 'div'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'div'} {...props} />;
}
