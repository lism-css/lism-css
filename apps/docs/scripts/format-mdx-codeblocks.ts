/**
 * MDXファイル内のコードブロックと<PreviewArea>内のJSXをprettierでフォーマットするスクリプト。
 * テーブルや文章などMarkdown部分には一切触れない。
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '../src/content');

// フォーマット対象の言語 → prettierパーサー
const PARSER_MAP: Record<string, string> = {
  js: 'babel',
  jsx: 'babel',
  ts: 'typescript',
  tsx: 'typescript',
  css: 'css',
  scss: 'scss',
  html: 'html',
  json: 'json',
};

// インデント付きも含むコードブロック（同じインデントレベルの ``` で開閉）
const CODE_BLOCK_REGEX = /^([ \t]*)```(\w+)([^\n]*)\n([\s\S]*?)^\1```$/gm;

// <PreviewArea ...> 〜 </PreviewArea>
const PREVIEW_AREA_REGEX = /^([ \t]*)<PreviewArea([^>]*)>\n([\s\S]*?)^\1<\/PreviewArea>/gm;

function getMdxFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getMdxFiles(fullPath));
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  return files;
}

/** インデントを除去 */
function dedent(code: string, indent: string): string {
  if (!indent) return code;
  return code
    .split('\n')
    .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
    .join('\n');
}

/** インデントを再付与 */
function reindent(code: string, indent: string): string {
  if (!indent) return code;
  return code
    .split('\n')
    .map((line) => (line ? indent + line : line))
    .join('\n');
}

/** JSX断片をフラグメントで囲んでフォーマットし、フラグメントを外す */
async function formatJsxFragment(code: string, prettierConfig: prettier.Options | null): Promise<string | null> {
  const wrapped = `<>\n${code}\n</>;\n`;
  const formatted = await prettier.format(wrapped, {
    ...prettierConfig,
    parser: 'babel',
  });

  // フラグメントのラッパーを外す
  const lines = formatted.trimEnd().split('\n');
  // 先頭の <> と末尾の </>; を除去
  if (lines[0]?.trim() === '<>' && (lines[lines.length - 1]?.trim() === '</>;' || lines[lines.length - 1]?.trim() === '</>')) {
    const inner = lines.slice(1, -1);
    // prettierがフラグメント内に付けたインデント（2スペース）を除去
    return inner.map((line) => (line.startsWith('  ') ? line.slice(2) : line)).join('\n');
  }

  return null;
}

async function formatFile(filePath: string, prettierConfig: prettier.Options | null): Promise<boolean> {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // 1. コードブロックをフォーマット
  {
    const matches: { full: string; indent: string; lang: string; meta: string; code: string; index: number }[] = [];
    let match;
    while ((match = CODE_BLOCK_REGEX.exec(content)) !== null) {
      matches.push({
        full: match[0],
        indent: match[1],
        lang: match[2],
        meta: match[3],
        code: match[4],
        index: match.index,
      });
    }

    for (const m of matches.reverse()) {
      const parser = PARSER_MAP[m.lang];
      if (!parser) continue;

      try {
        const dedented = dedent(m.code, m.indent);
        const formatted = await prettier.format(dedented, { ...prettierConfig, parser });
        let trimmed = formatted.trimEnd();
        // jsx/tsxコードブロックの末尾セミコロンを除去
        if ((m.lang === 'jsx' || m.lang === 'tsx') && trimmed.endsWith(';')) {
          trimmed = trimmed.slice(0, -1);
        }
        const result = reindent(trimmed, m.indent);

        if (result !== m.code.trimEnd()) {
          const replacement = `${m.indent}\`\`\`${m.lang}${m.meta}\n${result}\n${m.indent}\`\`\``;
          content = content.slice(0, m.index) + replacement + content.slice(m.index + m.full.length);
          changed = true;
        }
      } catch {
        // 不完全なコードスニペット等はスキップ
      }
    }
  }

  // 2. <PreviewArea> 内のJSXをフォーマット
  {
    const matches: { full: string; indent: string; attrs: string; code: string; index: number }[] = [];
    let match;
    while ((match = PREVIEW_AREA_REGEX.exec(content)) !== null) {
      matches.push({
        full: match[0],
        indent: match[1],
        attrs: match[2],
        code: match[3],
        index: match.index,
      });
    }

    for (const m of matches.reverse()) {
      try {
        // PreviewArea 内のインデントは1段深い
        const innerIndent = m.indent + '  ';
        const dedented = dedent(m.code, innerIndent);
        const formatted = await formatJsxFragment(dedented, prettierConfig);

        if (formatted === null) continue;

        const result = reindent(formatted, innerIndent);

        if (result !== m.code.trimEnd()) {
          const replacement = `${m.indent}<PreviewArea${m.attrs}>\n${result}\n${m.indent}</PreviewArea>`;
          content = content.slice(0, m.index) + replacement + content.slice(m.index + m.full.length);
          changed = true;
        }
      } catch {
        // フォーマット失敗時はスキップ
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
  }

  return changed;
}

async function main() {
  const prettierConfig = await prettier.resolveConfig(CONTENT_DIR);
  const files = getMdxFiles(CONTENT_DIR);

  let formattedCount = 0;

  for (const file of files) {
    const wasFormatted = await formatFile(file, prettierConfig);
    if (wasFormatted) {
      const rel = path.relative(process.cwd(), file);
      console.log(`formatted: ${rel}`);
      formattedCount++;
    }
  }

  console.log(`\n${formattedCount} file(s) formatted.`);
}

void main();
