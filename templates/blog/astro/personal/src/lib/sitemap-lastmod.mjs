import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---/;
const MARKDOWN_FILE_PATTERN = /\.(md|mdx)$/;

export function loadPostLastmodMap({ postsDir, stripFirstSegment = false }) {
  const postsRoot = postsDir instanceof URL ? fileURLToPath(postsDir) : postsDir;
  const lastmodMap = new Map();

  if (!existsSync(postsRoot)) {
    return lastmodMap;
  }

  for (const filePath of walkMarkdownFiles(postsRoot)) {
    const frontmatter = extractFrontmatter(readFileSync(filePath, 'utf8'));
    if (!frontmatter) continue;

    const lastmod = getPostLastmod(frontmatter, filePath);
    if (!lastmod) continue;

    lastmodMap.set(toPostPathname(postsRoot, filePath, { stripFirstSegment }), lastmod);
  }

  return lastmodMap;
}

function* walkMarkdownFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const filePath = join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walkMarkdownFiles(filePath);
    } else if (entry.isFile() && MARKDOWN_FILE_PATTERN.test(entry.name)) {
      yield filePath;
    }
  }
}

function extractFrontmatter(content) {
  return content.match(FRONTMATTER_PATTERN)?.[1];
}

function getFrontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, 'm'));
  if (!match) return undefined;

  return normalizeYamlScalar(match[1]);
}

function normalizeYamlScalar(value) {
  let normalized = value.trim();
  if (!normalized) return undefined;

  const quote = normalized[0];
  if (quote === "'" || quote === '"') {
    const closingIndex = normalized.indexOf(quote, 1);
    if (closingIndex > 0) {
      normalized = normalized.slice(1, closingIndex).trim();
    }
  } else {
    normalized = normalized.replace(/(?:^|\s)#.*$/, '').trim();
  }

  return normalized || undefined;
}

function getPostLastmod(frontmatter, filePath) {
  const updated = getFrontmatterValue(frontmatter, 'updated');
  const date = getFrontmatterValue(frontmatter, 'date');
  const updatedIso = toIsoDate(updated);
  const dateIso = toIsoDate(date);

  warnInvalidDateValue({ key: 'updated', value: updated, isoValue: updatedIso, filePath });
  warnInvalidDateValue({ key: 'date', value: date, isoValue: dateIso, filePath });

  return updatedIso ?? dateIso;
}

function warnInvalidDateValue({ key, value, isoValue, filePath }) {
  if (value && !isoValue) {
    console.warn(`[sitemap] Invalid ${key} value in ${filePath}: ${value}`);
  }
}

function toIsoDate(value) {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toPostPathname(postsRoot, filePath, { stripFirstSegment }) {
  const relativePath = relative(postsRoot, filePath);
  const parts = relativePath.split(sep);
  const filename = parts.pop().replace(MARKDOWN_FILE_PATTERN, '');
  const slugParts = stripFirstSegment ? parts.slice(1) : parts;

  return `/posts/${[...slugParts, filename].map(encodeURIComponent).join('/')}/`;
}
