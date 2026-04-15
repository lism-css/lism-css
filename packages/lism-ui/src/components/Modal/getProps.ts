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

export const defaultProps = {
  openBtn: {
    as: 'button',
    set: 'plain',
    hov: 'o',
    d: 'inline-flex',
  },
  closeBtn: {
    as: 'button',
    set: 'plain',
    hov: 'o',
    d: 'inline-flex',
  },
} as const;
