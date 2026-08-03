/**
 * `lism-mockup check` … 非対話の検証（エージェントの自己確認用）。
 *
 * 保証するのは3点まで。
 * 1. `mockup.config.json` / `tokens.json` のスキーマ検証
 * 2. import 境界検証（`dev` と同一のプラグイン）
 * 3. 全ページの bundle 成功（`build.write: false` でファイルは書き出さない）
 *
 * render 時エラー（default export が React コンポーネントでない・初回 render の例外等）は対象外で、
 * 人間の `dev` ブラウザ確認に残す。
 */
import pc from 'picocolors';
import { build } from 'vite';

import { getViewerDir } from '../core/paths.js';
import { prepareMockRuntime } from '../core/runtime.js';
import { MockupContractError, type MockupData } from '../core/types.js';
import { createMockViteConfig } from '../vite/config.js';

export interface CheckCommandOptions {
  /** ビューアディレクトリの上書き（テスト用。既定は同梱ビューア）。 */
  viewerDir?: string;
}

/** rollup / vite が投げたエラーを、対象ファイルと原因が分かる契約エラーへ整形する。 */
function toCheckError(error: unknown): MockupContractError {
  if (error instanceof MockupContractError) return error;

  const err = error as { message?: string; id?: string; frame?: string; loc?: { file?: string; line?: number; column?: number } };
  const file = err.loc?.file ?? err.id;
  const position = err.loc?.line !== undefined ? `:${err.loc.line}${err.loc.column !== undefined ? `:${err.loc.column}` : ''}` : '';
  const parts = [err.message ?? String(error)];
  if (err.frame) parts.push(err.frame);

  return new MockupContractError(parts.join('\n'), { file: file ? `${file}${position}` : undefined });
}

function printSummary(data: MockupData): void {
  const tokenCount = Object.values(data.tokens).reduce((total, group) => total + Object.keys(group).length, 0);

  console.log(pc.green('[lism-mockup] check passed'));
  console.log(pc.dim(`  data directory: ${data.dataDir}`));
  console.log(pc.dim(`  pages: ${data.pages.length} (${data.pages.map((page) => page.id).join(', ')})`));
  console.log(pc.dim(`  tokens: ${tokenCount} override(s)`));
}

export async function checkCommand(dir: string, options: CheckCommandOptions = {}): Promise<void> {
  const runtime = await prepareMockRuntime(dir);
  try {
    await build(createMockViteConfig({ runtime, viewerDir: options.viewerDir ?? getViewerDir(), mode: 'build' }));
  } catch (error) {
    throw toCheckError(error);
  } finally {
    runtime.cleanup();
  }

  printSummary(runtime.data);
}
