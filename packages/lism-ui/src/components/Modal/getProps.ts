import atts from 'lism-css/lib/helper/atts';

export type ModalRootProps = {
  lismClass?: string;
  duration?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
};

export type ModalInnerProps = {
  lismClass?: string;
  offset?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
};

export function getProps({ lismClass = '', duration, style = {}, ...props }: ModalRootProps) {
  const theProps = {
    lismClass: atts(lismClass, 'c--modal'),
    setPlain: true,
  };
  if (duration) {
    style['--duration'] = duration;
  }

  return { as: 'dialog', ...theProps, style, ...props };
}

export function getInnerProps({ lismClass = '', offset, style = {}, ...props }: ModalInnerProps) {
  if (offset) {
    style['--offset'] = offset;
  }
  return {
    lismClass: atts(lismClass, 'c--modal_inner'),
    style,
    ...props,
  };
}

export const defaultProps = {
  body: { lismClass: 'c--modal_body' },
  closeBtn: { as: 'button', setPlain: true, hov: 'o', d: 'in-flex' },
  openBtn: { as: 'button', setPlain: true, hov: 'o', d: 'in-flex' },
} as const;
