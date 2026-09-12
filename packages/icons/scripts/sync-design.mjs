import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packageDir } from './config.mjs';
import { generateJsx } from './gen-jsx.mjs';
import { importSvg } from './import-svg.mjs';
import { generate } from './generate.mjs';

try {
  if (process.argv.length !== 2) throw new Error('Usage: sync-design.mjs');
  const workDir = await mkdtemp(join(tmpdir(), 'lism-icons-'));
  console.log(`Work directory and AI backup: ${workDir}`);
  const config = generateJsx(workDir);
  for (const script of ['01-sync', '02-export']) {
    await new Promise((resolve, reject) => {
      const child = spawn('bash', [join(packageDir, 'scripts/run-ai.sh'), join(workDir, `${script}.jsx`)], { stdio: 'inherit' });
      child.on('error', reject);
      child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} failed (${code})`))));
    });
  }
  console.log(`Imported ${await importSvg(join(config.exportDir, 'SVG'))} SVGs`);
  console.log(`Generated ${await generate()} files`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
