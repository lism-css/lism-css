import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getInvokeCommand } from './invokeCommand';

const ORIGINAL_ARGV1 = process.argv[1];

function setScriptPath(value: string): void {
  process.argv[1] = value;
}

describe('getInvokeCommand', () => {
  beforeEach(() => {
    vi.stubEnv('npm_config_user_agent', '');
    vi.stubEnv('npm_command', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.argv[1] = ORIGINAL_ARGV1;
  });

  describe('ローカル / グローバル install', () => {
    it('macOS 形式のローカル node_modules/.bin から起動 → lism', () => {
      setScriptPath('/Users/me/project/node_modules/.bin/lism');
      expect(getInvokeCommand()).toBe('lism');
    });

    it('Windows 形式のローカル node_modules/.bin から起動 → lism', () => {
      setScriptPath('C:\\Users\\me\\project\\node_modules\\.bin\\lism');
      expect(getInvokeCommand()).toBe('lism');
    });

    it('Windows で pnpm exec 経由に多い .mjs 直接起動でも lism', () => {
      // Windows の .cmd シムは node_modules/lism-cli/bin/lism.mjs を直接呼ぶ
      setScriptPath('C:\\Users\\me\\project\\node_modules\\lism-cli\\bin\\lism.mjs');
      expect(getInvokeCommand()).toBe('lism');
    });

    it('グローバル install（PM 情報なし、dlx キャッシュでもない）→ lism', () => {
      setScriptPath('/usr/local/bin/lism');
      expect(getInvokeCommand()).toBe('lism');
    });

    it('pnpm exec 経由のローカル起動（ua=pnpm でもパスが dlx でない）→ lism', () => {
      setScriptPath('/Users/me/project/node_modules/.bin/lism');
      vi.stubEnv('npm_config_user_agent', 'pnpm/9.0.0 npm/? node/v20.0.0 darwin x64');
      expect(getInvokeCommand()).toBe('lism');
    });
  });

  describe('一時実行（npx / dlx / bunx）', () => {
    it('npm の npx（macOS の _npx キャッシュ）→ npx lism-cli', () => {
      setScriptPath('/Users/me/.npm/_npx/abc123/node_modules/lism-cli/bin/lism.mjs');
      vi.stubEnv('npm_config_user_agent', 'npm/10.2.4 node/v20.11.0 darwin x64');
      expect(getInvokeCommand()).toBe('npx lism-cli');
    });

    it('npm の npx（Windows の _npx キャッシュ）→ npx lism-cli', () => {
      setScriptPath('C:\\Users\\me\\AppData\\Local\\npm-cache\\_npx\\abc123\\node_modules\\lism-cli\\bin\\lism.mjs');
      vi.stubEnv('npm_config_user_agent', 'npm/10.2.4 node/v20.11.0 win32 x64');
      expect(getInvokeCommand()).toBe('npx lism-cli');
    });

    it('pnpm dlx（dlx-xxx ディレクトリ + ua=pnpm）→ pnpm dlx lism-cli', () => {
      setScriptPath('/Users/me/Library/Caches/pnpm/dlx-abc123/node_modules/lism-cli/bin/lism.mjs');
      vi.stubEnv('npm_config_user_agent', 'pnpm/9.0.0 npm/? node/v20.0.0 darwin x64');
      expect(getInvokeCommand()).toBe('pnpm dlx lism-cli');
    });

    it('pnpm dlx（Windows パス）→ pnpm dlx lism-cli', () => {
      setScriptPath('C:\\Users\\me\\AppData\\Local\\pnpm\\store\\v3\\dlx-xyz\\node_modules\\lism-cli\\bin\\lism.mjs');
      vi.stubEnv('npm_config_user_agent', 'pnpm/9.0.0 npm/? node/v20.0.0 win32 x64');
      expect(getInvokeCommand()).toBe('pnpm dlx lism-cli');
    });

    it('yarn berry dlx → yarn dlx lism-cli', () => {
      setScriptPath('/Users/me/project/.yarn/berry/cache/lism-cli-npm-0.3.0/node_modules/lism-cli/bin/lism.mjs');
      vi.stubEnv('npm_config_user_agent', 'yarn/4.0.0 npm/? node/v20.0.0 darwin x64');
      expect(getInvokeCommand()).toBe('yarn dlx lism-cli');
    });

    it('bunx（.bun/install/cache 配下 + ua=bun）→ bunx lism-cli', () => {
      setScriptPath('/Users/me/.bun/install/cache/lism-cli@0.3.0/bin/lism.mjs');
      vi.stubEnv('npm_config_user_agent', 'bun/1.1.0 npm/? node/v20.0.0 darwin x64');
      expect(getInvokeCommand()).toBe('bunx lism-cli');
    });

    it('dlx キャッシュ配下だが ua が取れない場合は npx lism-cli にフォールバック', () => {
      setScriptPath('/Users/me/.npm/_npx/abc123/node_modules/lism-cli/bin/lism.mjs');
      expect(getInvokeCommand()).toBe('npx lism-cli');
    });
  });
});
