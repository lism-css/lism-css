import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '../../..');
const fixturePath = resolve(currentDir, 'ResponsiveProps.module-augmentation.spec-d.ts');

function getDiagnosticsText(diagnostics: readonly ts.Diagnostic[]): string {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => packageRoot,
    getNewLine: () => '\n',
  });
}

describe('lism-css module augmentation fixture', () => {
  it('lism-css root module への augmentation が内部型に反映される', () => {
    const configPath = resolve(packageRoot, 'tsconfig.json');
    const configFile = ts.readConfigFile(configPath, (fileName) => ts.sys.readFile(fileName));
    if (configFile.error) {
      throw new Error(getDiagnosticsText([configFile.error]));
    }

    const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, packageRoot, {
      baseUrl: packageRoot,
      paths: {
        'lism-css': ['./src/index.ts'],
      },
    });
    const compilerOptions: ts.CompilerOptions = {
      ...parsedConfig.options,
      composite: false,
      declaration: false,
      declarationDir: undefined,
      declarationMap: false,
      emitDeclarationOnly: false,
      incremental: false,
      noEmit: true,
      rootDir: packageRoot,
      types: ['node', 'react'],
    };
    const program = ts.createProgram({
      rootNames: [fixturePath],
      options: compilerOptions,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);

    expect(diagnostics, getDiagnosticsText(diagnostics)).toHaveLength(0);
  });
});
