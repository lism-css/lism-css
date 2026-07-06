import { select } from '@inquirer/prompts';
import { t } from '../../i18n.js';
import type { LismCliConfig } from '../../config.js';

export interface PromptUiConfigOptions {
  framework?: LismCliConfig['framework'];
  dir?: string;
}

/**
 * UI セクション（`framework`/`dir`）の値を決定する。
 * ファイルの読み書きは一切行わない。永続化するかどうかは呼び出し側の責務
 * （`initCommand` は書き込み、`addCommand` は今回限りの値として使うだけ）。
 *
 * `dir` は本質的に config に書く値であり、毎回対話で尋ねる必要は無いため
 * 既定値をそのまま採用する（変更したい場合は `--ui-dir` フラグ、または
 * `lism.config.js` の `ui:` セクションを直接編集してもらう）。`framework` は
 * react/astro を確実に自動判定できない（Astro + React アイランド併用等）ため、
 * 唯一の対話質問として残す。
 */
export async function promptUiConfig(options: PromptUiConfigOptions = {}): Promise<LismCliConfig> {
  const framework =
    options.framework ??
    (await select<LismCliConfig['framework']>({
      message: t('ui.promptFramework'),
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Astro', value: 'astro' },
      ],
    }));

  const dir = options.dir ?? 'src/components/ui';

  return { framework, dir };
}
