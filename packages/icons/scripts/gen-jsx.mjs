import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { packageDir, rawDir, icons, layout, expectedDots } from './config.mjs';

const args = process.argv.slice(2);
if (!args[0] || args[0].startsWith('--') || (args.length !== 1 && (args.length !== 3 || args[1] !== '--ai-path' || !args[2]))) {
  console.error('Usage: node gen-jsx.mjs {outputDir} [--ai-path {path}]');
  process.exit(1);
}

const outputDir = path.resolve(args[0]);
const requestedAiPath = path.resolve(args[2] ?? path.join(packageDir, 'design/lism-icons.ai'));
if (path.extname(requestedAiPath).toLowerCase() !== '.ai') throw new Error('--ai-path must end in .ai');
// Resolve existing ancestors too, so /tmp and its real path identify the same document.
function canonicalPath(filePath) {
  try {
    return realpathSync(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return path.join(canonicalPath(path.dirname(filePath)), path.basename(filePath));
  }
}

const rectOf = (index) => {
  const left = (index % layout.columns) * (layout.size + layout.gap);
  const top = layout.size - Math.floor(index / layout.columns) * (layout.size + layout.gap);
  return [left, top, left + layout.size, top - layout.size];
};
const config = {
  aiPath: canonicalPath(requestedAiPath),
  rawDir: canonicalPath(rawDir),
  exportDir: canonicalPath(path.join(outputDir, 'export')),
  icons: icons.map((icon, index) => ({ ...icon, index, rect: rectOf(index) })),
  size: layout.size,
  expectedDots,
};
const template = (file) => readFileSync(new URL(`./ai/${file}.jsx`, import.meta.url), 'utf8');
const common = template('common');
const literal = (value) =>
  JSON.stringify(value)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
mkdirSync(outputDir, { recursive: true });

function generate(label, body, extra = {}) {
  const settings = { ...config, ...extra, logPath: canonicalPath(path.join(outputDir, `${label}.log`)) };
  const source = `(function () {\nvar config = ${literal(settings)};\nvar log = [];\n${common}\ntry {\n${body}\nwriteLog("LISM_OK: ${label}\\n" + log.join("\\n"));\nreturn "LISM_OK: ${label}\\n" + log.join("\\n");\n} catch (error) {\nvar failure = "LISM_ERROR: ${label}: " + error;\ntry { writeLog(failure + "\\n" + log.join("\\n")); } catch (logError) { failure += "\\nLog: " + logError; }\nreturn failure;\n}\n}());\n`;
  writeFileSync(path.join(outputDir, `${label}.jsx`), source);
}

generate('01-create', template('create'));
let batches = 0;
for (let start = 0; start < icons.length; start += layout.batchSize) {
  batches++;
  generate(`02-place-${String(batches).padStart(2, '0')}`, template('place'), { items: config.icons.slice(start, start + layout.batchSize) });
}
generate('03-convert-dots', template('convert-dots'));
generate('04-verify', template('verify'));
generate('05-export', template('export'));
console.log(`Generated ${batches + 4} JSX files for ${icons.length} icons in ${outputDir}`);
