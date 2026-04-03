import { Lism } from 'lism-css/react';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import './style.css';

function getTableProps({ thBgc, thC, bdwX, bdwY, cellMinSz, cellP, style = {}, ...props }) {
  if (bdwX) style['--bdw-x'] = bdwX;
  if (bdwY) style['--bdw-y'] = bdwY;
  if (thC) style['--th-c'] = getMaybeCssVar(thC, 'color');
  if (thBgc) style['--th-bgc'] = getMaybeCssVar(thBgc, 'color');
  if (cellMinSz) style['--cell-min-sz'] = cellMinSz;
  if (cellP) style['--cell-p'] = cellP;

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
