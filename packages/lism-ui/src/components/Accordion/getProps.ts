import atts from 'lism-css/lib/helper/atts';
import mergeSet from 'lism-css/lib/helper/mergeSet';

export type AccordionRootProps = {
  className?: string;
  allowMultiple?: boolean;
  [key: string]: unknown;
};

export type AccordionItemProps = {
  className?: string;
  [key: string]: unknown;
};

export type AccordionHeadingProps = {
  as?: string;
  role?: string;
  className?: string;
  [key: string]: unknown;
};

export type AccordionPanelProps = {
  className?: string;
  _contextID?: string;
  accID?: string;
  isOpen?: boolean;
  [key: string]: unknown;
};

export function getRootProps({ className, allowMultiple, ...props }: AccordionRootProps) {
  props.className = atts(className, 'c--accordion');
  if (allowMultiple) props['data-allow-multiple'] = '';
  return props;
}

export function getItemProps({ className, ...props }: AccordionItemProps) {
  props.className = atts(className, 'c--accordion_item');
  return props;
}

export function getHeadingProps({ as = 'div', role, className, set, ...props }: AccordionHeadingProps) {
  const returnProps = {
    className: atts(className, 'c--accordion_heading'),
    as,
    set: mergeSet('plain', set),
    ...props,
  };

  if (returnProps.as === 'div') {
    (returnProps as Record<string, unknown>).role = role ?? 'heading';
  }
  return returnProps;
}

export function getButtonProps({ className, set, ...props }: { className?: string; set?: unknown; [key: string]: unknown }) {
  return {
    className: atts(className, 'c--accordion_button'),
    as: 'button',
    layout: 'flex',
    set: mergeSet('plain', set),
    g: '10',
    w: '100%',
    ai: 'center',
    jc: 'between',
    ...props,
  };
}

export function getPanelProps({ className, _contextID, accID = '__LISM_ACC_ID__', isOpen = false, ...props }: AccordionPanelProps) {
  const panelProps = {
    className: atts(className, 'c--accordion_panel'),
    id: _contextID || accID,
    hidden: isOpen ? undefined : ('until-found' as unknown as boolean),
    pos: 'relative',
    ov: 'hidden',
  };

  const contentProps = { className: 'c--accordion_content', layout: 'flow' as const, ...props };

  return { panelProps, contentProps };
}

export const defaultProps = {
  icon: {
    className: 'c--accordion_icon',
    atomic: 'icon',
    as: 'span',
    pi: 'center',
    fxsh: '0',
    'aria-hidden': 'true',
  },
} as const;
