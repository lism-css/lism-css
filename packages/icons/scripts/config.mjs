import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const packageDir = fileURLToPath(new URL('../', import.meta.url));
export const rawDir = fileURLToPath(new URL('../design/raw/', import.meta.url));
export const mapping = JSON.parse(readFileSync(new URL('./mapping.json', import.meta.url), 'utf8'));
const sourceIcons = [
  ...mapping.map(({ lism, src }) => ({ id: lism, grid: 256, fill: src === 'fill' })),
  { id: 'menu-2', grid: 24, fill: false },
  { id: 'star-half', grid: 24, fill: false, mixed: true },
];
export const coreIconNames = [
  'folder',
  'tag',
  'calendar',
  'clock',
  'clockwise',
  'check',
  'check-circle',
  'ban',
  'alert',
  'warning',
  'question',
  'info',
  'good',
  'bad',
  'bookmark',
  'note',
  'chat',
  'lightbulb',
  'link',
  'gear',
  'home',
  'search',
  'sign-in',
  'sign-out',
  'user',
  'x',
  'menu',
  'dots',
  'dots-vertical',
  'caret-down',
  'caret-right',
  'arrow-down',
  'arrow-right',
  'menu-2',
];
const coreSet = new Set(coreIconNames);
const coreIcons = sourceIcons.filter(({ id }) => coreSet.has(id));
const extraStrokeIcons = sourceIcons.filter(({ id, fill }) => !coreSet.has(id) && !fill);
const fillIcons = sourceIcons.filter(({ fill }) => fill);
export const icons = [...coreIcons, ...extraStrokeIcons, ...fillIcons];
export const layout = { size: 24, gap: 12, sectionGap: 36, columns: 10, batchSize: 10 };

export function getArtboardRect(index) {
  const step = layout.size + layout.gap;
  let localIndex = index;
  let leftOffset = 0;
  let topOffset = 0;
  if (index >= coreIcons.length) {
    localIndex = index - coreIcons.length;
    topOffset = Math.ceil(coreIcons.length / layout.columns) * step + layout.sectionGap - layout.gap;
    if (localIndex >= extraStrokeIcons.length) {
      localIndex -= extraStrokeIcons.length;
      leftOffset = Math.min(extraStrokeIcons.length, layout.columns) * step;
      if (extraStrokeIcons.length) leftOffset += layout.sectionGap - layout.gap;
    }
  }
  const left = leftOffset + (localIndex % layout.columns) * step;
  const top = layout.size - Math.floor(localIndex / layout.columns) * step - topOffset;
  return [left, top, left + layout.size, top - layout.size];
}
export const expectedDots = {
  alert: 1,
  calendar: 5,
  chat: 3,
  dots: 3,
  'dots-vertical': 3,
  info: 1,
  lock: 1,
  'lock-open': 1,
  question: 1,
  tag: 1,
  warning: 1,
};
