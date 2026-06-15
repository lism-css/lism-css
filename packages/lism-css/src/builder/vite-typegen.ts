/**
 * 型 `.d.ts` 自動生成 Vite プラグイン（#427 / P4）。
 *
 * lism.config.js の breakpoints から `BreakpointRegistry` augmentation の `.d.ts` を
 * プロジェクト直下へ生成し、xs/xl 等を config だけで型側にも解禁する（#428 の手書きを置換）。
 *
 * 生成物は **コミット対象**（next-env.d.ts 方式）。Astro の `astro check`（型チェック）は本プラグインを
 * 動かさないため、コミット済みファイルが型チェックの拠り所になる。dev / build 起動時に内容が変わった
 * 時だけ書き込み（HMR ループ回避）、追加キーが無くなった場合は生成物を削除する。
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

import { loadBuildConfigs } from './load-config';
import { generateBreakpointDts } from './gen-types';

/** 生成する `.d.ts` のファイル名（vite-env.d.ts / next-env.d.ts に倣ったプロジェクト直下配置）。 */
export const TYPES_FILENAME = 'lism-env.d.ts';

export interface SyncTypesOptions {
  /** dist 成果物のルート（テスト等で source 実行する際に明示）。 */
  distDir?: string;
  log?: (message: string) => void;
}

/**
 * `.d.ts` の内容（`generateBreakpointDts` の結果）を projectRoot へ反映する IO 部分。
 *
 * - `content` あり: 内容が変わった時だけ書き込む（HMR ループ・無駄な git 差分の回避）。
 * - `content` が null: 追加解禁キーが無い（デフォルト sm/md/lg のみ）ので、既存の生成物があれば削除する。
 */
export function writeBreakpointDts(projectRoot: string, content: string | null, log?: (message: string) => void): void {
  const filePath = path.join(projectRoot, TYPES_FILENAME);

  if (content === null) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath);
      log?.(`🧹 [lism-css] removed ${TYPES_FILENAME} (no extra breakpoints)`);
    }
    return;
  }

  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
  if (current === content) return;
  fs.writeFileSync(filePath, content, 'utf8');
  log?.(`📝 [lism-css] generated ${TYPES_FILENAME}`);
}

/**
 * projectRoot の lism.config を読み、breakpoints から `.d.ts` を生成 / 更新 / 削除する。
 */
export async function syncBreakpointDts(projectRoot: string, opts: SyncTypesOptions = {}): Promise<void> {
  const { mainConfig } = await loadBuildConfigs(projectRoot, { distDir: opts.distDir });
  writeBreakpointDts(projectRoot, generateBreakpointDts(mainConfig.breakpoints), opts.log);
}

export interface LismTypegenOptions {
  /** 型 `.d.ts` 自動生成を無効化する。 */
  disabled?: boolean;
}

/**
 * 型 `.d.ts` を dev / build 起動時に同期する Vite プラグイン。
 */
export function lismTypegen(options: LismTypegenOptions = {}): Plugin {
  let root = '';
  return {
    name: 'lism-css:typegen',
    enforce: 'pre',
    configResolved(c) {
      root = c.root;
    },
    async buildStart() {
      if (options.disabled) return;
      await syncBreakpointDts(root || process.cwd());
    },
  };
}

export default lismTypegen;
