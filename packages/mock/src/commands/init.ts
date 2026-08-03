import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pc from 'picocolors';

export interface InitOptions {
  force: boolean;
}

/**
 * Bundled scaffold templates.
 *
 * `src/commands/init.ts` and the compiled `dist/commands/init.js` sit at the
 * same depth below the package root, so one relative URL works for both the
 * test run (from `src`) and the published build (from `dist`).
 */
const TEMPLATES_DIR = fileURLToPath(new URL('../../templates/', import.meta.url));

/** List every template file as a POSIX-style path relative to the template root. */
async function collectTemplateFiles(root: string, relative = ''): Promise<string[]> {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const files: string[] = [];

  for (const entry of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
    const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await collectTemplateFiles(root, childRelative)));
    } else if (entry.isFile()) {
      files.push(childRelative);
    }
  }

  return files;
}

/**
 * Scaffold a data directory (sample pages + contract guide).
 *
 * Existing files are never touched without `--force`: the whole file list is
 * checked up front and a single collision aborts the command before anything is
 * written.
 */
export async function initCommand(dir: string, options: InitOptions): Promise<void> {
  const targetDir = path.resolve(dir);

  let templateFiles: string[];
  try {
    templateFiles = await collectTemplateFiles(TEMPLATES_DIR);
  } catch {
    templateFiles = [];
  }
  if (templateFiles.length === 0) {
    throw new Error(`Scaffold templates are missing from the installed package (expected in ${TEMPLATES_DIR}). Reinstall @lism-css/mock.`);
  }

  if (!options.force) {
    const conflicts = templateFiles.filter((relative) => existsSync(path.join(targetDir, relative)));
    if (conflicts.length > 0) {
      throw new Error(
        [
          `${conflicts.length} file(s) already exist in ${targetDir}. Nothing was written.`,
          ...conflicts.map((relative) => `  - ${relative}`),
          'Re-run with --force to overwrite them, or pick an empty directory.',
        ].join('\n')
      );
    }
  }

  const created: string[] = [];
  try {
    for (const relative of templateFiles) {
      const destination = path.join(targetDir, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      // `wx` keeps the no-overwrite guarantee even if a file appears between the
      // collision check above and this write.
      await writeFile(destination, await readFile(path.join(TEMPLATES_DIR, relative)), {
        flag: options.force ? 'w' : 'wx',
      });
      created.push(relative);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const partial =
      created.length > 0
        ? [
            `${created.length} file(s) were written before the failure and are left in place:`,
            ...created.map((relative) => `  - ${relative}`),
            `Remove them (or the whole directory) and run "lism-mock init ${dir}" again, or re-run with --force.`,
          ]
        : ['No files were written.'];

    throw new Error([`Failed while writing the scaffold: ${reason}`, ...partial].join('\n'));
  }

  console.log(pc.green(`[lism-mock] Created ${created.length} file(s) in ${targetDir}:`));
  for (const relative of created) {
    console.log(pc.dim(`  ${relative}`));
  }
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Read ${path.join(dir, 'README.md')} — it is the data contract for this directory.`);
  console.log('  2. Edit pages/*.jsx, mock.config.json and tokens.json.');
  console.log(`  3. Run "lism-mock check ${dir}" to validate (this is the self-check for agents).`);
  console.log(`  4. Run "lism-mock dev ${dir}" to review the screens in a browser.`);
}
