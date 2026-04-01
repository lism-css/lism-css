import atts from 'lism-css/lib/helper/atts';

export function getRootProps({ lismClass, allowMultiple, ...props }) {
  props.lismClass = atts(lismClass, 'c--accordion');
  if (allowMultiple) props['data-allow-multiple'] = '';
  return props;
}

// duration: [s]
export function getItemProps({ lismClass, ...props }) {
  props.lismClass = atts(lismClass, 'c--accordion_item');
  return props;
}

export function getHeadingProps(props) {
  const defaultProps = {
    lismClass: 'c--accordion_heading',
    as: 'div',
    setPlain: 1,
  };

  const returnProps = { ...defaultProps, ...props };

  // div の時は role 付与
  if (returnProps.as === 'div') {
    returnProps.role = 'heading';
  }
  return returnProps;
}

// id: Context から取得できればそれを優先（React用）
export function getPanelProps({ lismClass, _contextID, accID = '__LISM_ACC_ID__', isOpen = false, ...props }) {
  // panel側は必要最低限のプロパティのみ。
  const panelProps = {
    lismClass: atts(lismClass, 'c--accordion_panel'),
    id: _contextID || accID,
    hidden: isOpen ? undefined : 'until-found',
    pos: 'relative',
    ov: 'hidden',
  };

  // 余白などその他の指定は全て _content 側へ渡す
  const contentProps = { lismClass: 'c--accordion_content', layout: 'flow', ...props };

  // content側へ移すprops
  // ['p', 'px', 'py', 'pl', 'pr', 'pt', 'pb', 'px-s', 'px-e', 'py-s', 'py-e'].forEach((prop) => {
  // 	if (props[prop]) {
  // 		contentProps[prop] = props[prop];
  // 		delete props[prop];
  // 	}
  // });

  // 2つ返す
  return { panelProps, contentProps };
}

export const defaultProps = {
  // header: { lismClass: 'c--accordion_header' },
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
    // d: 'grid',
    pi: 'center',
    fxsh: '0',
    'aria-hidden': 'true',
  },
};
