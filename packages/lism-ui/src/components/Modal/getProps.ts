export type ModalRootProps = {
  set?: string;
  duration?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
};

export type ModalInnerProps = {
  offset?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
};

export function getProps({ set = 'plain', duration, style = {}, ...props }: ModalRootProps) {
  if (duration) {
    style['--duration'] = duration;
  }

  return {
    as: 'dialog',
    set,
    style,
    ...props,
  };
}

export function getInnerProps({ offset, style = {}, ...props }: ModalInnerProps) {
  if (offset) {
    style['--offset'] = offset;
  }
  return {
    style,
    ...props,
  };
}

export function getOpenBtnProps({ set = 'plain', ...props }: Record<string, unknown>) {
  return {
    as: 'button',
    set,
    hov: 'o',
    d: 'inline-flex',
    ...props,
  };
}

export function getCloseBtnProps({ set = 'plain', ...props }: Record<string, unknown>) {
  return {
    as: 'button',
    set,
    hov: 'o',
    d: 'inline-flex',
    ...props,
  };
}
