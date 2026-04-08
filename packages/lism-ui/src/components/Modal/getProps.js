import atts from 'lism-css/lib/helper/atts';

export function getProps({ lismClass = '', duration, style = {}, ...props }) {
  const theProps = {
    lismClass: atts(lismClass, 'c--modal'),
    setPlain: true,
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

export const defaultProps = {
  body: { lismClass: 'c--modal_body' },
  closeBtn: { as: 'button', setPlain: true, hov: 'o', d: 'inline-flex' },
  openBtn: { as: 'button', setPlain: true, hov: 'o', d: 'inline-flex' },
};
