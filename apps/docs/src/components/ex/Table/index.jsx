import { Lism } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import './style.css';

function getTableProps({ thBgc, thC, bdwX, bdwY, tdMinSz, thMinSz, tdP, style = {}, ...props }) {
  if (bdwX) style['--bdw-x'] = bdwX;
  if (bdwY) style['--bdw-y'] = bdwY;
  if (thC) style['--th-c'] = getMaybeCssVar(thC, 'color');
  if (thBgc) style['--th-bgc'] = getMaybeCssVar(thBgc, 'color');
  if (tdMinSz) style['--td-min-sz'] = tdMinSz;
  if (thMinSz) style['--th-min-sz'] = thMinSz;
  if (tdP) style['--td-p'] = tdP;

  props.style = style;

  return props;
}

export default function Table({ children, className, ...props }) {
  return (
    <Lism as="table" {...getTableProps(props)} className={atts(className, 'c--table')}>
      {children}
    </Lism>
  );
}
