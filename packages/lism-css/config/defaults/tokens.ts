export default {
  fz: ['root', 'base', '5xl', '4xl', '3xl', '2xl', 'xl', 'l', 'm', 's', 'xs', '2xs'],
  lh: ['base', 'xs', 's', 'l'],
  hl: ['base', 'xs', 's', 'l'],
  lts: ['base', 's', 'l'],
  ff: ['base', 'accent', 'mono'],
  fw: ['light', 'normal', 'bold'],
  o: ['-10', '-20', '-30'],
  bdrs: ['10', '20', '30', '40', '99', 'inner'],
  bxsh: ['10', '20', '30', '40'],
  sz: ['xs', 's', 'm', 'l', 'xl', 'min', 'full', 'container'],
  ar: ['og'],
  space: {
    pre: '--s',
    values: ['5', '10', '15', '20', '30', '40', '50', '60', '70', '80'],
  },
  c: {
    pre: '--',
    values: ['base', 'base-2', 'text', 'text-2', 'divider', 'link', 'brand', 'accent'],
  },
  palette: {
    pre: '--',
    values: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'gray', 'white', 'black', 'keycolor'],
  },
  writing: ['vertical'],
  flow: ['s', 'l'],
} as const;
