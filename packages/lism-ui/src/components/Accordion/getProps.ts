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

export function getRootProps({ lismClass, allowMultiple, ...props }: AccordionRootProps): Record<string, unknown> {
  props.lismClass = atts(lismClass, 'c--accordion');
  if (allowMultiple) props['data-allow-multiple'] = '';
  return props;
}

export function getItemProps({ lismClass, ...props }: AccordionItemProps): Record<string, unknown> {
  props.lismClass = atts(lismClass, 'c--accordion_item');
  return props;
}

export function getHeadingProps(props: AccordionHeadingProps): Record<string, unknown> {
  const defaultHeadingProps = {
    lismClass: 'c--accordion_heading',
    as: 'div',
    setPlain: 1,
  };

  const returnProps: Record<string, unknown> = { ...defaultHeadingProps, ...props };

  if (returnProps.as === 'div') {
    returnProps.role = 'heading';
  }
  return returnProps;
}

export function getPanelProps({ lismClass, _contextID, accID = '__LISM_ACC_ID__', isOpen = false, ...props }: AccordionPanelProps): {
  panelProps: Record<string, unknown>;
  contentProps: Record<string, unknown>;
} {
  const panelProps: Record<string, unknown> = {
    lismClass: atts(lismClass, 'c--accordion_panel'),
    id: _contextID || accID,
    hidden: isOpen ? undefined : 'until-found',
    pos: 'relative',
    ov: 'hidden',
  };

  const contentProps: Record<string, unknown> = { lismClass: 'c--accordion_content', layout: 'flow', ...props };

  return { panelProps, contentProps };
}

export const defaultProps = {
  button: {
    lismClass: 'c--accordion_button',
    as: 'button',
    layout: 'flex',
    setPlain: 1,
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
};
