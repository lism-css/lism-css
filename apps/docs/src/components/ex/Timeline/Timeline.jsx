import { Lism, Center, Grid, Icon, Decorator } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import './style.css';

export function Root({ children, isHorizontal, className, ...props }) {
  return (
    <Grid gaf={isHorizontal ? 'c' : null} lh="s" {...props} className={atts(className, 'c--timeline', isHorizontal && 'c--timeline--horizontal')}>
      {children}
    </Grid>
  );
}

export function Line({ className, ...props }) {
  return <Decorator bgc="divider" jslf="center" {...props} className={atts(className, 'c--timeline_line')} />;
}
export function Shape({ className, ...props }) {
  return <Center pos="relative" z="1" c="base" ar="1/1" bdrs="99" jslf="center" {...props} className={atts(className, 'c--timeline_shape')} />;
}

export function Item({ isHorizontal, isStart, isEnd, isHighlighted, icon, iconProps = {}, shapeColor, children, className, ...props }) {
  let dataTimeline = null;
  let lineProps = {
    gr: isHorizontal ? '1' : '1/-1',
    gc: isHorizontal ? '1/-1' : '1',
  };
  let shapeProps = {
    gr: isHorizontal ? '1' : '2',
    gc: isHorizontal ? '2' : '1',
  };

  if (isStart) {
    dataTimeline = 'start';
    lineProps[`${isHorizontal ? 'jslf' : 'aslf'}`] = 'e';
  }
  if (isEnd) {
    dataTimeline = 'end';
    lineProps = Object.assign(lineProps, isHorizontal ? { jslf: 's' } : { gr: '1 / 3', aslf: 's' });
  }
  if (icon) {
    shapeProps.className = '_hasIcon';
  }

  return (
    <Grid
      data-timeline={dataTimeline}
      ai="center"
      ji={isHorizontal ? 'c' : null}
      gtr={isHorizontal ? 'subgrid' : null}
      gr={isHorizontal ? '1/-1' : null}
      cg={isHorizontal ? null : '20'}
      rg={isHorizontal ? '10' : null}
      {...props}
      className={atts(className, 'c--timeline_item')}
    >
      <Line {...lineProps} />
      <Shape bgc={shapeColor || 'text'} {...shapeProps}>
        {isHighlighted && <Decorator className="c--timeline_highlight" as="span" pos="absolute" z="-1" bgc="inherit" bdrs="99" o="-30" />}
        {icon && <Icon icon={icon} style={{ scale: '0.625' }} {...iconProps} />}
      </Shape>
      {children}
    </Grid>
  );
}

export function Time({ className, ...props }) {
  return <Lism fz="xs" fw="bold" gr="2" gc="2" {...props} className={atts(className, 'c--timeline_time')} />;
}
export function Title({ className, ...props }) {
  return <Lism fz="s" fw="bold" gr="3" gc="2" {...props} className={atts(className, 'c--timeline_title')} />;
}
export function Text({ className, ...props }) {
  return <Lism fz="s" my-s="15" gr="4" gc="2" {...props} className={atts(className, 'c--timeline_text')} />;
}
