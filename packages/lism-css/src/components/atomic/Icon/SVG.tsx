import type { SVGProps } from 'react';

type SVGComponentProps = SVGProps<SVGSVGElement> & {
  size?: string;
  path?: string;
  __html?: string;
};

export default function SVG({ size = '1em', fill = 'currentColor', viewBox = '0 0 24 24', path, children, __html, ...props }: SVGComponentProps) {
  if (__html) {
    return (
      <svg
        dangerouslySetInnerHTML={{ __html }}
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        width={size}
        height={size}
        fill={fill}
        focusable="false"
      ></svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width={size} height={size} fill={fill} focusable="false" {...props}>
      {path && <path d={path}></path>}
      {children}
    </svg>
  );
}
