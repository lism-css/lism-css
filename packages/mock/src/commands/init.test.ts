import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initCommand } from './init.js';

const EXPECTED_FILES = [
  'AGENTS.md',
  'README.md',
  'mock.config.json',
  'tokens.json',
  'pages/landing.jsx',
  'pages/admin/dashboard.jsx',
  'pages/admin/settings.jsx',
  'pages/admin/settings.css',
];

let tmpDir: string;
let logSpy: ReturnType<typeof vi.spyOn>;

async function exists(file: string): Promise<boolean> {
  try {
    await readFile(file);
    return true;
  } catch {
    return false;
  }
}

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'lism-mock-init-'));
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  logSpy.mockRestore();
  await rm(tmpDir, { recursive: true, force: true });
});

describe('initCommand', () => {
  it('scaffolds the full template set into an empty directory', async () => {
    const target = path.join(tmpDir, 'mock');

    await initCommand(target, { force: false });

    for (const relative of EXPECTED_FILES) {
      expect(await exists(path.join(target, relative)), `${relative} should exist`).toBe(true);
    }
  });

  it('generates a mock.config.json with schemaVersion 1 and a parsable tokens.json', async () => {
    const target = path.join(tmpDir, 'mock');

    await initCommand(target, { force: false });

    const config = JSON.parse(await readFile(path.join(target, 'mock.config.json'), 'utf-8')) as {
      schemaVersion: number;
      pages?: Record<string, unknown>;
    };
    expect(config.schemaVersion).toBe(1);
    // Metadata may only reference page ids that exist on disk.
    for (const pageId of Object.keys(config.pages ?? {})) {
      expect(await exists(path.join(target, 'pages', `${pageId}.jsx`)), `page ${pageId} should exist`).toBe(true);
    }

    const tokens = JSON.parse(await readFile(path.join(target, 'tokens.json'), 'utf-8')) as Record<string, Record<string, string | number>>;
    expect(typeof tokens.color).toBe('object');
  });

  it('aborts without writing anything when a target file already exists', async () => {
    const target = path.join(tmpDir, 'mock');
    await mkdir(path.join(target, 'pages'), { recursive: true });
    await writeFile(path.join(target, 'pages', 'landing.jsx'), '// keep me\n');

    await expect(initCommand(target, { force: false })).rejects.toThrow(/already exist/);

    // The existing file is untouched and no other template file was created.
    expect(await readFile(path.join(target, 'pages', 'landing.jsx'), 'utf-8')).toBe('// keep me\n');
    expect(await exists(path.join(target, 'README.md'))).toBe(false);
    expect(await exists(path.join(target, 'mock.config.json'))).toBe(false);
  });

  it('lists every conflicting file in the error message', async () => {
    const target = path.join(tmpDir, 'mock');
    await mkdir(target, { recursive: true });
    await writeFile(path.join(target, 'README.md'), 'old\n');
    await writeFile(path.join(target, 'tokens.json'), '{}\n');

    await expect(initCommand(target, { force: false })).rejects.toThrow(/README\.md[\s\S]*tokens\.json/);
  });

  it('aborts without writing anything when a parent path is a regular file', async () => {
    const target = path.join(tmpDir, 'mock');
    await mkdir(target, { recursive: true });
    // `pages/` を作れないので、AGENTS.md 等を書いてから失敗する状態を作る。
    await writeFile(path.join(target, 'pages'), 'not a directory\n');

    await expect(initCommand(target, { force: false })).rejects.toThrow(/already exist as something else[\s\S]*- pages/);

    expect(await readFile(path.join(target, 'pages'), 'utf-8')).toBe('not a directory\n');
    for (const relative of EXPECTED_FILES) {
      expect(await exists(path.join(target, relative)), `${relative} should not be created`).toBe(false);
    }
  });

  it('keeps refusing a non-directory parent path with --force', async () => {
    const target = path.join(tmpDir, 'mock');
    await mkdir(target, { recursive: true });
    await writeFile(path.join(target, 'pages'), 'not a directory\n');

    await expect(initCommand(target, { force: true })).rejects.toThrow(/not even with --force/);

    expect(await readFile(path.join(target, 'pages'), 'utf-8')).toBe('not a directory\n');
    expect(await exists(path.join(target, 'AGENTS.md'))).toBe(false);
  });

  it('aborts when an output file path is a directory, even with --force', async () => {
    const target = path.join(tmpDir, 'mock');
    await mkdir(path.join(target, 'README.md'), { recursive: true });

    await expect(initCommand(target, { force: true })).rejects.toThrow(/already exist as something else[\s\S]*- README\.md/);

    expect(await exists(path.join(target, 'AGENTS.md'))).toBe(false);
  });

  it('aborts when the target directory itself is a regular file', async () => {
    const target = path.join(tmpDir, 'mock');
    await writeFile(target, 'occupied\n');

    await expect(initCommand(target, { force: true })).rejects.toThrow(/already exist as something else[\s\S]*- \./);

    expect(await readFile(target, 'utf-8')).toBe('occupied\n');
  });

  it('overwrites existing files with --force', async () => {
    const target = path.join(tmpDir, 'mock');
    await mkdir(path.join(target, 'pages'), { recursive: true });
    await writeFile(path.join(target, 'pages', 'landing.jsx'), '// stale\n');
    await writeFile(path.join(target, 'tokens.json'), '{ "broken": true }\n');

    await initCommand(target, { force: true });

    expect(await readFile(path.join(target, 'pages', 'landing.jsx'), 'utf-8')).not.toBe('// stale\n');
    const tokens = JSON.parse(await readFile(path.join(target, 'tokens.json'), 'utf-8')) as Record<string, unknown>;
    expect(tokens.broken).toBeUndefined();
    expect(tokens.color).toBeDefined();
    for (const relative of EXPECTED_FILES) {
      expect(await exists(path.join(target, relative)), `${relative} should exist`).toBe(true);
    }
  });
});
