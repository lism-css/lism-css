import { Lism, type LismComponentProps } from '../Lism';

type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';
type HeadingTag = `h${HeadingLevel}`;
type HeadingProps = LismComponentProps<'h1', HeadingTag> & {
  level?: HeadingLevel;
};

export default function Heading({ level = '2', ...props }: HeadingProps) {
  const tag: HeadingTag = `h${level}`;
  return <Lism as={tag} {...props} />;
}
