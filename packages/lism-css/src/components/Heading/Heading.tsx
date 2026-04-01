import { Lism, type LismComponentProps } from '../Lism';

type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';
type HeadingTag = `h${HeadingLevel}`;
type HeadingProps = LismComponentProps<'h1'> & {
  lv?: HeadingLevel;
};

export default function Heading({ lv = '2', ...props }: HeadingProps) {
  const tag: HeadingTag = `h${lv}`;
  return <Lism as={tag} {...props} />;
}
