import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';

import { expectedDots, icons } from './config.mjs';

const directory = process.argv[2];
const frameBounds = {
  calendar: { x: 3.75, y: 3.75, width: 16.5, height: 16.5 },
  lock: { x: 3.75, y: 8.25, width: 16.5, height: 12 },
  'lock-open': { x: 3.75, y: 8.25, width: 16.5, height: 12 },
};

if (!directory) {
  console.error('Usage: na exec node packages/icons/scripts/verify-export.mjs {svg-directory}');
  process.exitCode = 1;
} else if (!existsSync(directory) || !statSync(directory).isDirectory()) {
  console.error(`SVG directory not found: ${directory}`);
  process.exitCode = 1;
} else {
  verify(directory);
}

function verify(directory) {
  const expectedIds = icons.map(({ id }) => id).sort();
  const expectedSet = new Set(expectedIds);
  const files = readdirSync(directory)
    .filter((file) => file.endsWith('.svg'))
    .sort();
  const actualIds = files.map((file) => file.slice(0, -4));
  const actualSet = new Set(actualIds);
  const errors = [];

  const missing = expectedIds.filter((id) => !actualSet.has(id));
  const extra = actualIds.filter((id) => !expectedSet.has(id));
  if (missing.length) errors.push(`missing: ${list(missing)}`);
  if (extra.length) errors.push(`unexpected: ${list(extra)}`);

  for (const { id, fill } of icons) {
    if (!actualSet.has(id)) continue;

    const svg = readFileSync(`${directory}/${id}.svg`, 'utf8');
    const elements = parseElements(svg);
    const root = elements.find(({ name }) => name === 'svg');
    const groups = elements.filter(({ name }) => name === 'g');
    const strokes = elements.filter(({ attributes }) => hasStroke(attributes));

    if (!isViewBox24(root?.attributes.viewBox)) errors.push(`${id}: viewBox`);
    if (!groups.some(({ attributes }) => attributes['data-name'] === id)) {
      errors.push(`${id}: group data-name`);
    }

    if (fill) {
      if (strokes.length) errors.push(`${id}: fill icon has stroke`);
    } else {
      if (!strokes.length) {
        errors.push(`${id}: missing stroke`);
      } else if (strokes.some(({ attributes }) => !isNumber(attributes['stroke-width'], 1.5))) {
        errors.push(`${id}: stroke-width`);
      }

      const filledDots = elements.filter(({ name, attributes }) => name === 'circle' && attributes.fill !== 'none');
      if (filledDots.length) errors.push(`${id}: filled circle`);
    }

    const dotCount = expectedDots[id];
    if (dotCount !== undefined) verifyDots(id, elements, dotCount, errors);
    const frame = frameBounds[id];
    if (frame) {
      const hasRoundedFrame = elements.some(
        ({ name, attributes }) =>
          name === 'rect' &&
          hasStroke(attributes) &&
          isNumber(attributes.x, frame.x) &&
          isNumber(attributes.y, frame.y) &&
          isNumber(attributes.width, frame.width) &&
          isNumber(attributes.height, frame.height) &&
          isNumber(attributes.rx, 0.75) &&
          isNumber(attributes.ry, 0.75)
      );
      if (!hasRoundedFrame) errors.push(`${id}: rounded frame`);
    }
  }

  if (errors.length) {
    console.error(`SVG export verification failed (${errors.length})`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`SVG export verified: ${expectedIds.length} icons`);
  }
}

function verifyDots(id, elements, expectedCount, errors) {
  const dots = elements.filter(({ name, attributes }) => name === 'circle' && isNumber(attributes.r, 0.375));
  const validDots = dots.filter(({ attributes }) => attributes.fill === 'none' && hasStroke(attributes) && isNumber(attributes['stroke-width'], 1.5));

  if (dots.length !== expectedCount || validDots.length !== expectedCount) {
    errors.push(`${id}: dots ${validDots.length}/${dots.length}/${expectedCount}`);
  }
}

function parseElements(svg) {
  return [...svg.matchAll(/<([A-Za-z][\w:.-]*)(?:\s[^<>]*)?\/?\s*>/g)].map((match) => ({
    name: match[1],
    attributes: parseAttributes(match[0]),
  }));
}

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(/([\w:.-]+)\s*=\s*(["'])(.*?)\2/g)) {
    attributes[match[1]] = match[3];
  }
  return attributes;
}

function hasStroke(attributes) {
  return attributes.stroke !== undefined && attributes.stroke.toLowerCase() !== 'none';
}

function isViewBox24(value) {
  return (
    value?.trim().split(/[\s,]+/).length === 4 &&
    value
      .trim()
      .split(/[\s,]+/)
      .every((part, index) => isNumber(part, index < 2 ? 0 : 24))
  );
}

function isNumber(value, expected) {
  return value !== undefined && Number(value) === expected;
}

function list(values) {
  const visible = values.slice(0, 8);
  return `${visible.join(', ')}${values.length > visible.length ? ` (+${values.length - visible.length})` : ''}`;
}
