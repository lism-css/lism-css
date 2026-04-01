/**
 * @deprecated Text, Inline, Group, Heading, Link, List, ListItem, Media を使用してください。
 */
import { Lism, type LismComponentProps } from '../Lism';

/** @deprecated Group を使用してください */
export function div(props: LismComponentProps<'div'>) {
  return <Lism as="div" {...props} />;
}

/** @deprecated Text を使用してください */
export function p(props: LismComponentProps<'p'>) {
  return <Lism as="p" {...props} />;
}

/** @deprecated Inline を使用してください */
export function span(props: LismComponentProps<'span'>) {
  return <Lism as="span" {...props} />;
}

/** @deprecated Link を使用してください */
export function a(props: LismComponentProps<'a'>) {
  return <Lism as="a" {...props} />;
}

type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';
type HeadingTag = `h${HeadingLevel}`;
type HeadingProps = LismComponentProps<'h1'> & {
  lv?: HeadingLevel;
};

/** @deprecated Heading を使用してください */
export function h({ lv = '1', ...props }: HeadingProps) {
  const tag: HeadingTag = `h${lv}`;
  return <Lism as={tag} {...props} />;
}

/** @deprecated Media を使用してください */
export function img(props: LismComponentProps<'img'>) {
  return <Lism as="img" {...props} />;
}

/** @deprecated List を使用してください */
export function ul(props: LismComponentProps<'ul'>) {
  return <Lism as="ul" {...props} />;
}

/** @deprecated List as="ol" を使用してください */
export function ol(props: LismComponentProps<'ol'>) {
  return <Lism as="ol" {...props} />;
}

/** @deprecated ListItem を使用してください */
export function li(props: LismComponentProps<'li'>) {
  return <Lism as="li" {...props} />;
}

/** @deprecated Lism as="button" を使用してください */
export function button(props: LismComponentProps<'button'>) {
  return <Lism as="button" {...props} />;
}
