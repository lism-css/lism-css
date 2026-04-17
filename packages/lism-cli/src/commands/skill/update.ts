import { skillAddCommand, type SkillAddOptions } from './add.js';

/** インストール済みのスキルを強制的に最新版で上書きする（= add --overwrite） */
export async function skillUpdateCommand(options: SkillAddOptions): Promise<void> {
  await skillAddCommand({ ...options, overwrite: true });
}
