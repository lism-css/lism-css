import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageDir } from './config.mjs';

function canonicalPath(filePath) {
  try {
    return realpathSync(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return path.join(canonicalPath(path.dirname(filePath)), path.basename(filePath));
  }
}

export function generateJsx(
  outputDir,
  { sourcePath = path.join(packageDir, 'design/original/lism-icons-geometric-study.ai'), aiPath = path.join(packageDir, 'design/lism-icons.ai') } = {}
) {
  outputDir = path.resolve(outputDir);
  sourcePath = canonicalPath(path.resolve(sourcePath));
  aiPath = canonicalPath(path.resolve(aiPath));
  if (![sourcePath, aiPath].every((file) => path.extname(file).toLowerCase() === '.ai')) throw new Error('Source and output must be .ai files');
  if (sourcePath === aiPath) throw new Error('Source and output must be different files');
  mkdirSync(outputDir, { recursive: true });
  const config = {
    sourcePath,
    aiPath,
    masterLayer: '01 Editable masters - 24px',
    size: 24,
    columns: 10,
    gap: 12,
    stagingPath: canonicalPath(path.join(outputDir, 'output-staging.ai')),
    backupPath: canonicalPath(path.join(outputDir, 'before-output.ai')),
    exportDir: canonicalPath(path.join(outputDir, 'export')),
  };
  const template = (file) => readFileSync(new URL(`./ai/${file}.jsx`, import.meta.url), 'utf8');
  for (const [label, body] of [
    ['01-sync', 'sync'],
    ['02-export', 'export'],
  ]) {
    const settings = { ...config, logPath: canonicalPath(path.join(outputDir, `${label}.log`)) };
    const literal = JSON.stringify(settings)
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
    const source = `(function () {\nvar config = ${literal};\nvar log = [];\n${template('common')}\ntry {\n${template(body)}\nvar result = "LISM_OK: ${label}\\n" + log.join("\\n");\nwriteLog(result);\nreturn result;\n} catch (error) {\nvar failure = "LISM_ERROR: ${label}: " + error;\ntry { writeLog(failure + "\\n" + log.join("\\n")); } catch (logError) {}\nreturn failure;\n}\n}());\n`;
    writeFileSync(path.join(outputDir, `${label}.jsx`), source);
  }
  return config;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [outputDir, ...args] = process.argv.slice(2);
    if (!outputDir || outputDir.startsWith('--') || args.length % 2)
      throw new Error('Usage: gen-jsx.mjs {outputDir} [--source-path {path}] [--ai-path {path}]');
    const options = {};
    for (let i = 0; i < args.length; i += 2) {
      const key = { '--source-path': 'sourcePath', '--ai-path': 'aiPath' }[args[i]];
      if (!key || options[key] || !args[i + 1]) throw new Error('Invalid option');
      options[key] = args[i + 1];
    }
    generateJsx(outputDir, options);
    console.log('Generated 01-sync.jsx and 02-export.jsx');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
