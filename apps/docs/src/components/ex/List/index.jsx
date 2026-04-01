import { Lism } from 'lism-css/react';
import './style.css';

export default function List({ tag = 'ul', iconC, iconImg, children, style = {}, ...props }) {
  if (iconC) style['--_icon-c'] = iconC;
  if (iconImg) style['--_icon-img'] = iconImg;
  return (
    <Lism as={tag} lismClass="c--list" style={style} {...props}>
      {children}
    </Lism>
  );
}
