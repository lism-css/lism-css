import { skillAddCommand, type SkillAddOptions } from './add.js';

/** 配置済みの全スキルを強制的に最新版で上書きする（= 引数なし add --overwrite） */
export async function skillUpdateCommand(options: SkillAddOptions): Promise<void> {
  await skillAddCommand(undefined, { ...options, overwrite: true });
}
