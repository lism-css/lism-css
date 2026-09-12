import { cp, mkdir, mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageDir } from './config.mjs';
import { verify } from './verify-export.mjs';

export async function importSvg(sourceDir, targetDir = join(packageDir, 'src/svg')) {
  const icons = await verify(sourceDir);
  await mkdir(dirname(targetDir), { recursive: true });
  const workDir = await mkdtemp(join(dirname(targetDir), '.svg-import-'));
  const staging = join(workDir, 'next');
  const previous = join(workDir, 'previous');
  let moved = false;
  try {
    await mkdir(staging);
    try {
      await cp(targetDir, staging, { recursive: true });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    for (const entry of await readdir(staging)) if (/\.svg$/i.test(entry)) await rm(join(staging, entry));
    for (const { id } of icons) await cp(join(sourceDir, `${id}.svg`), join(staging, `${id}.svg`));
    await verify(staging);
    try {
      await rename(targetDir, previous);
      moved = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    try {
      await rename(staging, targetDir);
    } catch (error) {
      if (moved) {
        await rename(previous, targetDir);
        moved = false;
      }
      throw error;
    }
    await rm(workDir, { recursive: true });
  } catch (error) {
    // Keep the previous SVGs if restoring the target directory also failed.
    if (!moved) await rm(workDir, { recursive: true, force: true });
    throw error;
  }
  return icons.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: import-svg.mjs {svg-directory}');
    console.log(`Imported ${await importSvg(resolve(process.argv[2]))} SVGs`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
