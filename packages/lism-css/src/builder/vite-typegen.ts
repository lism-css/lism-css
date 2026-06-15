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
import { normalizePath, type Plugin } from 'vite';

import { loadBuildConfigs, findUserConfigPath } from './load-config';
import { generateBreakpointDts, GENERATED_MARKER } from './gen-types';

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
    // 自動生成マーカーを含むファイルだけ削除する（手書きの同名ファイルを巻き込まない）。
    if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8').includes(GENERATED_MARKER)) {
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
 * 型 `.d.ts` を dev / build 起動時に同期し、dev 中の lism.config.js 変更にも追従する Vite プラグイン。
 */
export function lismTypegen(options: LismTypegenOptions = {}): Plugin {
  let root = '';
  // handleHotUpdate で「変更ファイルが lism.config か」を判定するために控える。
  let userConfigPath: string | null = null;
  return {
    name: 'lism-css:typegen',
    enforce: 'pre',
    configResolved(c) {
      root = c.root;
    },
    async buildStart() {
      if (options.disabled) return;
      userConfigPath = findUserConfigPath(root || process.cwd());
      await syncBreakpointDts(root || process.cwd());
    },
    // dev 中に lism.config.js の breakpoints を変更したら .d.ts を再生成する。
    // vite-css / config-alias は full-reload を送るが、型生成は副作用として別途追従させる必要がある。
    // （writeBreakpointDts は内容不変なら書き込まないため、生成物自身の変更で HMR ループにはならない）
    async handleHotUpdate(ctx) {
      if (options.disabled || !userConfigPath) return;
      if (normalizePath(ctx.file) !== normalizePath(userConfigPath)) return;
      await syncBreakpointDts(root || process.cwd());
    },
  };
}

export default lismTypegen;
