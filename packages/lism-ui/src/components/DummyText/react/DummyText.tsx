import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import getContent from '../getContent';

type DummyTextProps<T extends ElementType = 'p'> = LismComponentProps<T> & {
  pre?: string;
  length?: string;
  lang?: 'ja' | 'en' | 'ar';
  offset?: number;
};

export default function DummyText<T extends ElementType = 'p'>({ pre = '', length = 'm', lang = 'en', offset = 0, ...props }: DummyTextProps<T>) {
  const content = getContent({ pre, lang, length, offset });
  return <Lism {...(props as LismComponentProps)} dangerouslySetInnerHTML={{ __html: content }} />;
}
