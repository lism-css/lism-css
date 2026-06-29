import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setLang } from './i18n';
import { readConfig, findConfigFile } from './config';

const cwd = process.cwd();
let tmpDir: string;

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

describe('lism.config.ts の読み込み', () => {
  beforeEach(() => {
    setLang('en');
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'lism-cli-config-')));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('findConfigFile が lism.config.ts を検出する', () => {
    writeFile(path.join(tmpDir, 'lism.config.ts'), 'export default {};\n');

    const found = findConfigFile();
    expect(found).toEqual({ path: path.join(tmpDir, 'lism.config.ts'), filename: 'lism.config.ts', kind: 'module' });
  });

  it('readConfig が lism.config.ts の cli セクションを読める（型注釈を含む TS 構文）', async () => {
    writeFile(
      path.join(tmpDir, 'lism.config.ts'),
      [
        "interface Cli { framework: 'react' | 'astro'; componentsDir: string; helperDir: string }",
        "const cli: Cli = { framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' };",
        'export default { cli };',
        '',
      ].join('\n')
    );

    const result = await readConfig();
    expect(result).toEqual({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
  });

  it('lism.config.js と lism.config.ts が同居する場合は .ts が優先される', () => {
    writeFile(path.join(tmpDir, 'lism.config.ts'), 'export default {};\n');
    writeFile(path.join(tmpDir, 'lism.config.js'), 'export default {};\n');

    expect(findConfigFile()?.filename).toBe('lism.config.ts');
  });
});
