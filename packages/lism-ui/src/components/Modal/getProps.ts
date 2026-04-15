import atts from 'lism-css/lib/helper/atts';
import mergeSet from 'lism-css/lib/helper/mergeSet';

export type ModalRootProps = {
  className?: string;
  set?: string;
  duration?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
};

export type ModalInnerProps = {
  className?: string;
  offset?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
};

export function getProps({ className = '', set, duration, style = {}, ...props }: ModalRootProps) {
  const theProps = {
    className: atts(className, 'c--modal'),
    set: mergeSet('plain', set),
  };
  if (duration) {
    style['--duration'] = duration;
  }

  return { as: 'dialog', ...theProps, style, ...props };
}

export function getInnerProps({ className = '', offset, style = {}, ...props }: ModalInnerProps) {
  if (offset) {
    style['--offset'] = offset;
  }
  return {
    className: atts(className, 'c--modal_inner'),
    style,
    ...props,
  };
}

export function getOpenBtnProps({ set, ...props }: Record<string, unknown>) {
  return {
    as: 'button',
    set: mergeSet('plain', set),
    hov: 'o',
    d: 'inline-flex',
    ...props,
  };
}

export function getCloseBtnProps({ set, ...props }: Record<string, unknown>) {
  return {
    as: 'button',
    set: mergeSet('plain', set),
    hov: 'o',
    d: 'inline-flex',
    ...props,
  };
}

export const defaultProps = {
  body: { className: 'c--modal_body' },
};
