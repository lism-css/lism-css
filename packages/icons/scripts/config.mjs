import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const packageDir = fileURLToPath(new URL('../', import.meta.url));
export const rawDir = fileURLToPath(new URL('../design/raw/', import.meta.url));
export const mapping = JSON.parse(readFileSync(new URL('./mapping.json', import.meta.url), 'utf8'));
export const icons = [...mapping.map(({ lism, src }) => ({ id: lism, grid: 256, fill: src === 'fill' })), { id: 'menu-2', grid: 24, fill: false }];
export const layout = { size: 24, gap: 12, columns: 10, batchSize: 10 };
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
