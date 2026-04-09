import atts from 'lism-css/lib/helper/atts';
import mergeSet from 'lism-css/lib/helper/mergeSet';

export function getProps({ lismClass = '', set, unset, duration, style = {}, ...props }) {
  const theProps = {
    lismClass: atts(lismClass, 'c--modal'),
    set: mergeSet('plain', set, unset),
  };
  if (duration) {
    style['--duration'] = duration;
  }

  return { as: 'dialog', ...theProps, style, ...props };
}

export function getInnerProps({ lismClass = '', offset, style = {}, ...props }) {
  if (offset) {
    style['--offset'] = offset;
  }
  return {
    lismClass: atts(lismClass, 'c--modal_inner'),
    style,
    ...props,
  };
}

export function getOpenBtnProps({ set, unset, ...props }) {
  return {
    as: 'button',
    set: mergeSet('plain', set, unset),
    hov: 'o',
    d: 'inline-flex',
    ...props,
  };
}

export function getCloseBtnProps({ set, unset, ...props }) {
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
