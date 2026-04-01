import { Lism, type LismComponentProps } from '../Lism';

export function div(props: LismComponentProps<'div'>) {
  return <Lism as="div" {...props} />;
}

export function p(props: LismComponentProps<'p'>) {
  return <Lism as="p" {...props} />;
}

export function span(props: LismComponentProps<'span'>) {
  return <Lism as="span" {...props} />;
}

export function a(props: LismComponentProps<'a'>) {
  return <Lism as="a" {...props} />;
}

type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';
type HeadingTag = `h${HeadingLevel}`;
type HeadingProps = LismComponentProps<'h1'> & {
  lv?: HeadingLevel;
};

export function h({ lv = '1', ...props }: HeadingProps) {
  const tag: HeadingTag = `h${lv}`;
  return <Lism as={tag} {...props} />;
}

export function img(props: LismComponentProps<'img'>) {
  return <Lism as="img" {...props} />;
}

export function ul(props: LismComponentProps<'ul'>) {
  return <Lism as="ul" {...props} />;
}

export function ol(props: LismComponentProps<'ol'>) {
  return <Lism as="ol" {...props} />;
}

export function li(props: LismComponentProps<'li'>) {
  return <Lism as="li" {...props} />;
}

export function button(props: LismComponentProps<'button'>) {
  return <Lism as="button" {...props} />;
}
