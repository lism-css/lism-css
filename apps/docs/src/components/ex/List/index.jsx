import { Lism } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import './style.css';

export default function List({ tag = 'ul', iconC, iconImg, variant, children, className, style = {}, ...props }) {
  if (iconC) style['--_icon-c'] = iconC;
  if (iconImg) style['--_icon-img'] = iconImg;
  return (
    <Lism as={tag} style={style} {...props} className={atts(className, 'c--list', variant && `c--list--${variant}`)}>
      {children}
    </Lism>
  );
}
