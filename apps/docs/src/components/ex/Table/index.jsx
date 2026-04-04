import { Lism } from 'lism-css/react';
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

export default function Table({ children, ...props }) {
  return (
    <Lism as="table" lismClass="c--table" {...getTableProps(props)}>
      {children}
    </Lism>
  );
}
