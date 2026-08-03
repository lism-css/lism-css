import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { Command } from 'commander';
import pc from 'picocolors';

import { checkCommand } from './commands/check.js';
import { devCommand } from './commands/dev.js';
import { initCommand } from './commands/init.js';
import { MockupContractError } from './core/types.js';

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf-8')) as {
  version: string;
};

/** Print a command failure and set the exit code (contract violations get a compact format). */
function fail(error: unknown): void {
  if (error instanceof MockupContractError) {
    console.error(pc.red(`[lism-mockup] ${error.message}`));
    if (error.file) console.error(pc.dim(`  at ${error.file}`));
  } else {
    console.error(pc.red(`[lism-mockup] ${error instanceof Error ? error.message : String(error)}`));
  }
  process.exitCode = 1;
}

const program = new Command();

program.name('lism-mockup').description('CLI for creating, validating, and previewing Lism CSS mockups').version(pkg.version);

program
  .command('init')
  .argument('[dir]', 'data directory (default: current directory)')
  .option('--force', 'overwrite existing files')
  .description('scaffold a mockup data directory (sample pages + contract guide)')
  .action(async (dir: string | undefined, options: { force?: boolean }) => {
    try {
      await initCommand(dir ?? '.', { force: options.force ?? false });
    } catch (error) {
      fail(error);
    }
  });

program
  .command('dev')
  .argument('[dir]', 'data directory (default: current directory)')
  .description('start the preview dev server (for humans, in a browser)')
  .action(async (dir: string | undefined) => {
    try {
      await devCommand(dir ?? '.');
    } catch (error) {
      fail(error);
    }
  });

program
  .command('check')
  .argument('[dir]', 'data directory (default: current directory)')
  .description('validate the data directory without starting a server (for agents)')
  .action(async (dir: string | undefined) => {
    try {
      await checkCommand(dir ?? '.');
    } catch (error) {
      fail(error);
    }
  });

program.parseAsync().catch((error: unknown) => {
  fail(error);
});
