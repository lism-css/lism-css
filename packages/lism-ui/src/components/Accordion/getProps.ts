import atts from 'lism-css/lib/helper/atts';

export type AccordionRootProps = {
  lismClass?: string;
  allowMultiple?: boolean;
  [key: string]: unknown;
};

export type AccordionItemProps = {
  lismClass?: string;
  [key: string]: unknown;
};

export type AccordionHeadingProps = {
  as?: string;
  role?: string;
  lismClass?: string;
  [key: string]: unknown;
};

export type AccordionPanelProps = {
  lismClass?: string;
  _contextID?: string;
  accID?: string;
  isOpen?: boolean;
  [key: string]: unknown;
};

export function getRootProps({ lismClass, allowMultiple, ...props }: AccordionRootProps) {
  props.lismClass = atts(lismClass, 'c--accordion');
  if (allowMultiple) props['data-allow-multiple'] = '';
  return props;
}

export function getItemProps({ lismClass, ...props }: AccordionItemProps) {
  props.lismClass = atts(lismClass, 'c--accordion_item');
  return props;
}

export function getHeadingProps({ as = 'div', role, lismClass, ...props }: AccordionHeadingProps) {
  return {
    lismClass: atts(lismClass, 'c--accordion_heading'),
    as,
    setPlain: true,
    role: as === 'div' ? 'heading' : role,
    ...props,
  };
}

export function getPanelProps({ lismClass, _contextID, accID = '__LISM_ACC_ID__', isOpen = false, ...props }: AccordionPanelProps) {
  const panelProps = {
    lismClass: atts(lismClass, 'c--accordion_panel'),
    id: _contextID || accID,
    hidden: isOpen ? undefined : ('until-found' as unknown as boolean),
    pos: 'relative',
    ov: 'hidden',
  };

  const contentProps = { lismClass: 'c--accordion_content', layout: 'flow' as const, ...props };

  return { panelProps, contentProps };
}

export const defaultProps = {
  button: {
    lismClass: 'c--accordion_button',
    as: 'button',
    layout: 'flex',
    setPlain: true,
    g: '10',
    w: '100%',
    ai: 'center',
    jc: 'between',
  },
  icon: {
    lismClass: 'c--accordion_icon a--icon',
    as: 'span',
    pi: 'center',
    fxsh: '0',
    'aria-hidden': 'true',
  },
} as const;
