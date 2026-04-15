export type AccordionRootProps = {
  allowMultiple?: boolean;
  [key: string]: unknown;
};

export type AccordionHeadingProps = {
  as?: string;
  role?: string;
  [key: string]: unknown;
};

export type AccordionPanelProps = {
  _contextID?: string;
  accID?: string;
  isOpen?: boolean;
  [key: string]: unknown;
};

export function getRootProps({ allowMultiple, ...props }: AccordionRootProps) {
  if (allowMultiple) props['data-allow-multiple'] = '';
  return props;
}

export function getHeadingProps({ as = 'div', role, set = 'plain', ...props }: AccordionHeadingProps) {
  const returnProps: Record<string, unknown> = {
    as,
    set,
    ...props,
  };

  if (as === 'div') {
    returnProps.role = role ?? 'heading';
  }
  return returnProps;
}

export function getButtonProps({ set = 'plain', ...props }: { set?: unknown; [key: string]: unknown }) {
  return {
    as: 'button',
    layout: 'flex',
    set,
    g: '10',
    w: '100%',
    ai: 'center',
    jc: 'between',
    ...props,
  };
}

export function getPanelProps({ _contextID, accID = '__LISM_ACC_ID__', isOpen = false, ...props }: AccordionPanelProps) {
  const panelProps = {
    id: _contextID || accID,
    hidden: isOpen ? undefined : ('until-found' as unknown as boolean),
    pos: 'relative' as const,
    ov: 'hidden' as const,
  };

  const contentProps = { layout: 'flow' as const, ...props };

  return { panelProps, contentProps };
}

export const defaultProps = {
  icon: {
    atomic: 'icon',
    as: 'span',
    pi: 'center',
    fxsh: '0',
    'aria-hidden': 'true',
  },
} as const;
