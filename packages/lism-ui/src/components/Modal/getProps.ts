import atts from 'lism-css/lib/helper/atts';
import mergeSet from 'lism-css/lib/helper/mergeSet';

export type ModalRootProps = {
  lismClass?: string;
  set?: string;
  unset?: string;
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

export function getProps({ lismClass = '', set, unset, duration, style = {}, ...props }: ModalRootProps) {
  const theProps = {
    lismClass: atts(lismClass, 'c--modal'),
    set: mergeSet('plain', set, unset),
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

export function getOpenBtnProps({ set, unset, ...props }: Record<string, unknown>) {
  return {
    as: 'button',
    set: mergeSet('plain', set, unset),
    hov: 'o',
    d: 'inline-flex',
    ...props,
  };
}

export function getCloseBtnProps({ set, unset, ...props }: Record<string, unknown>) {
  return {
    as: 'button',
    set: mergeSet('plain', set, unset),
    hov: 'o',
    d: 'inline-flex',
    ...props,
  };
}

export const defaultProps = {
  body: { lismClass: 'c--modal_body' },
};
